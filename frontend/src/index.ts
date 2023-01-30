import './index.scss';
import AWN from 'awesome-notifications';

import { BackendConnector } from './scripts/BackendConnector';
import Gallery from './scripts/Gallery';

export const notifier = new AWN();

main().catch(console.error);

async function main() {
  const galleryElement = document.getElementById('gallery');
  if (galleryElement == null) {
    throw new Error('Could not find gallery element');
  }

  const gallery = new Gallery(galleryElement);

  const scannedObjects = await BackendConnector.getObjectList();
  for (const scannedObject of scannedObjects) {
    gallery.addEntry(scannedObject);
  }

  for (const scannedObject of scannedObjects) {
    const objectWithPoints = await BackendConnector.getObject(scannedObject.id);
    gallery.setPointsForEntry(objectWithPoints);
  }
}
