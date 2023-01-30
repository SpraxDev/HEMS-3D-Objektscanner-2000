import AWN from 'awesome-notifications';

import './index.scss';
import Gallery from './scripts/Gallery';

export const notifier = new AWN({
  labels: {
    success: 'Erfolg',
    async: 'Laden...',
    confirm: 'Bestätigung erforderlich',
    confirmOk: 'OK',
    confirmCancel: 'Abbrechen',
  },
  messages: {
    'async-block': 'Laden'
  }
});

main().catch(console.error);

async function main() {
  const galleryElement = document.getElementById('gallery');
  if (galleryElement == null) {
    throw new Error('Could not find gallery element');
  }

  const gallery = new Gallery(galleryElement);
  notifier.async(Gallery.fetchObjectsAndInit(gallery), '3D Modelle wurden geladen', undefined, 'Gespeicherte 3D Modelle');
}
