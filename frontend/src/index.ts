import AWN from 'awesome-notifications';

import './index.scss';
import { BackendConnector } from './scripts/BackendConnector';
import Gallery from './scripts/Gallery';
import ModelRenderer from './scripts/ModelRenderer';

export const notifier = new AWN({
  labels: {
    async: 'Laden...',
    success: 'Erfolg',
    warning: 'Warnung',
    confirm: 'Bestätigung erforderlich',
    confirmOk: 'OK',
    confirmCancel: 'Abbrechen',
  },
  messages: {
    'async-block': 'Laden'
  }
});

let scannerRenderer: ModelRenderer | null = null;

main().catch(console.error);

async function main() {
  setupScannerButtons();
  notifier.async(refreshScannerStatus(), 'Scanner Status wurde aktualisiert', undefined, 'Scanner Status');

  const galleryElement = document.getElementById('gallery');
  if (galleryElement == null) {
    throw new Error('Could not find gallery element');
  }

  const gallery = new Gallery(galleryElement);
  notifier.async(Gallery.fetchObjectsAndInit(gallery), '3D Modelle wurden geladen', undefined, 'Gespeicherte 3D Modelle');
}

function setupScannerButtons(): void {
  const startButton = document.querySelector<HTMLElement>('#scannerControls .btn-scan-start');
  startButton?.addEventListener('click', () => {
    notifier.asyncBlock(BackendConnector.startScan(), 'Scan wurde gestartet', undefined, 'Scan starten');
  });
  startButton?.removeAttribute('disabled');

  const stopButton = document.querySelector<HTMLElement>('#scannerControls .btn-scan-stop');
  stopButton?.addEventListener('click', () => {
    notifier.asyncBlock(BackendConnector.stopScan(), 'Scan wurde gestoppt', undefined, 'Scan stoppen');
  });
  stopButton?.removeAttribute('disabled');

  const refreshButton = document.querySelector<HTMLElement>('#scannerControls .btn-scan-refresh');
  refreshButton?.addEventListener('click', () => {
    notifier.asyncBlock(refreshScannerStatus(), 'Scanner Status wurde aktualisiert', undefined, 'Scanner Status');
  });
  refreshButton?.removeAttribute('disabled');
}

async function refreshScannerStatus(): Promise<void> {
  const statusElement = document.querySelector<HTMLElement>('#scannerControls .text-scan-status');
  const statusCanvas = document.querySelector<HTMLCanvasElement>('#scannerControls canvas');

  try {
    const scanStatus = await BackendConnector.getScanStatus();

    let statusText = `Scan aktiv: ${scanStatus.running ? 'Ja' : 'Nein'}`;
    statusText += '<br>\n';
    statusText += `Bisherige Messpunkte: ${scanStatus.measurementData.length * (scanStatus.measurementData[0]?.length ?? 0)}`;

    statusElement.innerHTML = statusText;

    scannerRenderer?.destroy();
    scannerRenderer = new ModelRenderer(statusCanvas, scanStatus.measurementData, scanStatus.measurementData.length > 0);
  } catch (err) {
    statusElement.innerHTML = '<strong>Unbekannter Status</strong>';

    scannerRenderer?.destroy();
    scannerRenderer = null;

    throw err;
  }
}
