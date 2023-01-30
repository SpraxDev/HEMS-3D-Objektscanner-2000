import { Pool, QueryResult } from 'pg';
import { AppConfig } from './global';

export default class PostgresDatabase {
  private pool: Pool;

  constructor(cfg: AppConfig['postgres']) {
    this.pool = new Pool({
      host: cfg.host,
      port: cfg.port,

      user: cfg.username,
      password: cfg.password,
      database: cfg.database,

      ssl: cfg.ssl ? { rejectUnauthorized: false } : false,
      max: cfg.poolSize
    });

    this.pool.on('error', (err, _client) => {
      console.error('Unexpected error on PostgresClient', err);
    });
  }

  isAvailable(): Promise<boolean> {
    return this.pool.query('SELECT 1;')
      .then(() => true)
      .catch(() => false);
  }

  async shutdown(): Promise<void> {
    return this.pool.end();
  }

  async findAllObjects(): Promise<ObjectModel[]> {
    const dbRes = await this.query('SELECT id,name,created_at FROM objects ORDER BY created_at DESC;');

    const result: ObjectModel[] = [];
    for (const row of dbRes.rows) {
      result.push({
        id: row.id,
        name: row.name,
        createdAt: row.created_at
      });
    }
    return result;
  }

  async findObjectById(objectId: number): Promise<ObjectModel | null> {
    const dbRes = await this.query('SELECT id,name,created_at FROM objects WHERE id=$1;', [objectId]);
    if (dbRes.rowCount === 0) {
      return null;
    }

    const row = dbRes.rows[0];
    return {
      id: row.id,
      name: row.name,
      createdAt: row.created_at
    };
  }

  async findPointsForObjectId(objectId: number): Promise<ObjectPointModel[]> {
    const dbRes = await this.query('SELECT id,object_id,height_index,rotary_table_index,normalized_measured_distance FROM object_measurements WHERE object_id=$1 ORDER BY height_index ASC, rotary_table_index ASC;', [objectId]);

    const result: ObjectPointModel[] = [];
    for (const row of dbRes.rows) {
      result.push({
        id: row.id,
        objectId: row.object_id,

        heightIndex: row.height_index,
        rotaryTableIndex: row.rotary_table_index,
        normalizedMeasuredDistance: row.normalized_measured_distance
      });
    }
    return result;
  }

  async updateObjectNameById(objectId: number, name: string): Promise<boolean> {
    const dbRes = await this.query('UPDATE objects SET name=$1 WHERE id=$2;', [name, objectId]);
    return dbRes.rowCount > 0;
  }

  async deleteObjectById(objectId: number): Promise<boolean> {
    const dbRest = await this.query('DELETE FROM objects WHERE id=$1;', [objectId]);
    return dbRest.rowCount > 0;
  }

  private query(query: string, values?: any[]): Promise<QueryResult> {
    return this.pool.query(query, values);
  }
}

export interface ObjectModel {
  readonly id: number;
  readonly name: string;
  readonly createdAt: Date;
}

export interface ObjectPointModel {
  readonly id: number;
  readonly objectId: number;

  readonly heightIndex: number;
  readonly rotaryTableIndex: number;
  readonly normalizedMeasuredDistance: number;
}
