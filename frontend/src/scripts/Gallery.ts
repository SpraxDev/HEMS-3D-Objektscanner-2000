import { notifier } from '..';
import { BackendConnector, ObjectResponseData } from './BackendConnector';
import ModelRenderer from './ModelRenderer';

export default class Gallery {
  private readonly templateElement: HTMLTemplateElement;
  private readonly galleryItemContainer: HTMLElement;

  private readonly entries = new Map<number, { element: HTMLElement, renderer: ModelRenderer }>();

  constructor(galleryElement: HTMLElement) {
    this.templateElement = galleryElement.getElementsByTagName('template')[0];
    this.galleryItemContainer = galleryElement;
  }

  addEntry(scannedObject: ObjectResponseData): void {
    const element = this.getClonedTemplate();

    const canvas = element.getElementsByTagName('canvas')[0];
    const renderer = new ModelRenderer(canvas, scannedObject.measurementData, true);

    const cardTitleElement = element.querySelector<HTMLElement>('.card-title')
    if (cardTitleElement != null) {
      cardTitleElement.innerText = scannedObject.name;
    }

    const cardTextElement = element.querySelector<HTMLElement>('.card-text');
    if (cardTextElement != null) {
      const date = new Date(scannedObject.createdAt);
      cardTextElement.appendChild(this.createBadgeSpan(date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })));

      const pointData = scannedObject.measurementData.length * (scannedObject.measurementData[0]?.length ?? 0);
      cardTextElement.appendChild(this.createBadgeSpan(`${pointData} Messpunkte`));
    }

    element.querySelector<HTMLElement>('.btn-rename')?.addEventListener('click', () => {
      const newName = prompt('Gespeichertes 3D Objekt umbenennen', scannedObject.name);

      if (newName == null) {
        notifier.info('Umbenennen abgebrochen');
        return;
      }
      if (newName.trim().length <= 0) {
        notifier.warning('Der Name darf nicht leer sein');
        return;
      }

      notifier.asyncBlock((async (): Promise<void> => {
        await BackendConnector.renameObject(scannedObject.id, newName);

        this.clear();
        await Gallery.fetchObjectsAndInit(this);
      })(), Gallery.htmlEscape(`'${scannedObject.name}' (ID ${scannedObject.id}) wurde in '${newName}' umbenannt`), undefined, '3D Objekt Umbenennen');
    });

    element.querySelector<HTMLElement>('.btn-download')?.addEventListener('click', () => {
      renderer.triggerExportDownload(this.sanitizeFilename(scannedObject.name));
      notifier.success(Gallery.htmlEscape(`'${scannedObject.name}' (ID ${scannedObject.id}) wurde heruntergeladen`));
    });

    element.querySelector<HTMLElement>('.btn-delete')?.addEventListener('click', () => {
      notifier.confirm('Möchtest du dieses Objekt wirklich löschen?', () => {
        notifier.asyncBlock((async (): Promise<void> => {
          await BackendConnector.deleteObject(scannedObject.id);
          this.removeEntry(scannedObject.id);
        })(), Gallery.htmlEscape(`'${scannedObject.name}' (ID ${scannedObject.id}) wurde gelöscht`), undefined, '3D Objekt Löschen');
      });
    });

    this.entries.set(scannedObject.id, { element, renderer });
    this.galleryItemContainer.appendChild(element);
  }

  removeEntry(id: number): void {
    const entry = this.entries.get(id);
    this.entries.delete(id);

    entry?.element.remove();
    entry?.renderer.destroy();
  }

  clear(): void {
    this.entries.forEach((entry) => {
      entry.element.remove();
      entry.renderer.destroy();
    });
    this.entries.clear();
  }

  private getClonedTemplate(): HTMLElement {
    const element = this.templateElement.content.firstElementChild?.cloneNode(true);
    if (element instanceof HTMLElement) {
      return element;
    }

    throw new Error('Unable to clone template as HTMLElement');
  }

  private createBadgeSpan(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.classList.add('badge', 'bg-primary', 'me-1');
    span.innerText = text;
    return span;
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9_.,]/gi, '_')
      .replace(/_+/g, '_');
  }

  static async fetchObjectsAndInit(gallery: Gallery): Promise<void> {
    const scannedObjects = await BackendConnector.getObjectList();
    for (const scannedObject of scannedObjects) {
      gallery.addEntry(scannedObject);
    }
  }

  private static htmlEscape(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
