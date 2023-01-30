import { handleRequestRestfully } from '@spraxdev/node-commons';
import Express from 'express';
import { getPostgresDatabase } from './Constants';

export function statusRoute(req: Express.Request, res: Express.Response, next: Express.NextFunction): void {
  handleRequestRestfully(req, res, next, {
    get: async () => {
      const dbAvailable = await getPostgresDatabase().isAvailable();

      res.send({
        webserver: true,
        database: dbAvailable
      });
    }
  });
}
