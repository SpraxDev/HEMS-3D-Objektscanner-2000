import { BACKEND_BASE_URL } from '../config';

export class BackendConnector {
  static async getScanStatus(): Promise<{ running: boolean, measurementData?: number[][] }> {
    const scanStatus = await BackendConnector.httpGet<{ running: boolean }>(`${BACKEND_BASE_URL}/api/scan/status`);
    return scanStatus;
  }

  static async startScan(): Promise<void> {
    await this.httpPost(`${BACKEND_BASE_URL}/api/scan/start`);
  }

  static async stopScan(): Promise<void> {
    await this.httpPost(`${BACKEND_BASE_URL}/api/scan/stop`);
  }

  static async getObjectList(): Promise<ObjectResponseData[]> {
    return await BackendConnector.httpGet<ObjectResponseData[]>(`${BACKEND_BASE_URL}/api/object/list`);
  }

  static async getObject(objectId: number): Promise<ObjectResponseData> {
    return BackendConnector.httpGet<ObjectResponseData>(`${BACKEND_BASE_URL}/api/object/${objectId}`);
  }

  static async renameObject(objectId: number, newName: string): Promise<void> {
    return BackendConnector.httpPost(`${BACKEND_BASE_URL}/api/object/${objectId}`, { action: 'rename', value: newName });
  }

  static async deleteObject(objectId: number): Promise<void> {
    return BackendConnector.httpDelete(`${BACKEND_BASE_URL}/api/object/${objectId}`);
  }

  private static async httpGet<T extends object>(url: string): Promise<T> {
    const response = await this.executeFetch('GET', url);
    return response.json();
  }

  private static async httpPost(url: string, data?: object): Promise<void> {
    await this.executeFetch('POST', url, data);
  }

  private static async httpDelete(url: string): Promise<void> {
    await this.executeFetch('DELETE', url);
  }

  private static async executeFetch(method: string, url: string, body?: object): Promise<Response> {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': body != null ? 'application/json' : undefined as any
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let errorMessage = `Got HTTP Status ${response.status} for URL '${url}'`;
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const responseBody = await response.json();
        if (responseBody.message) {
          errorMessage = `${responseBody.message} – ${errorMessage}`;
        }
      }

      throw new Error(errorMessage);
    }
    return response;
  }
}

export interface ObjectResponseData {
  readonly id: number;
  readonly name: string;
  readonly createdAt: Date;

  readonly measurementData: number[][];
}
