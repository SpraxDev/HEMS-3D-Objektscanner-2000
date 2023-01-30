import { ObjectByIdResponse, ObjectModel } from './BackendConnector';
import ModelRenderer from './ModelRenderer';

export default class Gallery {
  private readonly templateElement: HTMLTemplateElement;
  private readonly galleryItemContainer: HTMLElement;

  private readonly entries = new Map<number, { element: HTMLElement, renderer?: ModelRenderer }>();

  constructor(galleryElement: HTMLElement) {
    this.templateElement = galleryElement.getElementsByTagName('template')[0];
    this.galleryItemContainer = this.templateElement.parentElement;
  }

  addEntry(scannedObject: ObjectModel): void {
    const element = this.getClonedTemplate();
    this.entries.set(scannedObject.id, { element });

    element.querySelector<HTMLElement>('.card-title').innerText = scannedObject.name;

    this.galleryItemContainer.appendChild(element);
  }

  setPointsForEntry(objectWithPoints: ObjectByIdResponse): void {
    const entry = this.entries.get(objectWithPoints.id);
    if (!entry) {
      throw new Error(`Unable to find entry for ID ${objectWithPoints.id}`);
    }
    if (entry.renderer) {
      throw new Error(`Renderer for ID ${objectWithPoints.id} already exists`);
    }

    const canvas = entry.element.getElementsByTagName('canvas')[0];
    entry.renderer = new ModelRenderer(canvas, objectWithPoints.measurementData, true);
  }

  private getClonedTemplate(): HTMLElement {
    const element = this.templateElement.content.firstElementChild.cloneNode(true);
    if (element instanceof HTMLElement) {
      return element;
    }

    throw new Error('Unable to clone template as HTMLElement');
  }
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9_.,]/gi, '_')
      .replace(/_+/g, '_');
  }

}
