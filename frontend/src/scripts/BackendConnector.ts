export class BackendConnector {
  private static readonly baseUrl = 'http://localhost:8089';

  static async getObject(objectId: number): Promise<ObjectByIdResponse> {
    return BackendConnector.httpGet<ObjectByIdResponse>(`${this.baseUrl}/api/object/${objectId}`);
  }

  static async getObjectList(): Promise<ObjectModel[]> {
    return await BackendConnector.httpGet<ObjectModel[]>(`${this.baseUrl}/api/object/list`);
  }

  private static async httpGet<T>(url: string): Promise<T> {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new Error(`Got HTTP Status ${response.status} for URL '${url}'`);
    }

    return response.json();
  }
}

export type ObjectByIdResponse = ObjectModel & { measurementData: number[][] };

export interface ObjectModel {
  readonly id: number;
  readonly name: string;
  readonly createdAt: Date;
}
