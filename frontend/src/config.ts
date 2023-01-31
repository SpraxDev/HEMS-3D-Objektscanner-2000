export function getBackendUri(path: string): string {
  const configuredBackendUrl = require('../config/config.json').backendUrl;
  if (typeof configuredBackendUrl == 'string' && configuredBackendUrl.length > 0) {
    return configuredBackendUrl + path;
  }

  return path;
}
