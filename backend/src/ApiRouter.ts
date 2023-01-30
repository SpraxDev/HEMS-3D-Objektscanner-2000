import Express from 'express';
import { handleRequestRestfully } from '@spraxdev/node-commons';
import { getPostgresDatabase } from './Constants';
import { ObjectModel } from './PostgresDatabase';

// POST /object/:scanId
//
// GET /scan/points?afterPointIndex=10

export function createApiRouter(): Express.Router {
  const router = Express.Router();

  router.use((req, res, next) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'User-Agent,Authorization,If-None-Match,Content-Type,If-Unmodified-Since',
    });
    next();
  });

  router.use('/object/list', objectListRoute);
  router.use('/object/:objectId', objectByIdRoute);

  router.use('/scan/status', scanStatusRoute);
  // router.use('/scan/points', scanPointsRoute);
  router.use('/scan/start', scanStartRoute);
  router.use('/scan/abort', scanAbortRoute);

  return router;
}

async function fetchObjectFromDatabase(objectId: number): Promise<(ObjectModel & { measurementData: number[][]; }) | null> {
  const db = getPostgresDatabase();

  const object = await db.findObjectById(objectId);
  if (object == null) {
    return null;
  }

  const measurementData = await fetchMeasurementDataForObject(objectId);
  return { ...object, measurementData };
}

async function fetchMeasurementDataForObject(objectId: number): Promise<number[][]> {
  const objectPoints = await getPostgresDatabase().findPointsForObjectId(objectId);

  const measurementData: number[][] = [];
  for (const point of objectPoints) {
    if (measurementData[point.rotaryTableIndex] == null) {
      measurementData[point.rotaryTableIndex] = [];
    }
    measurementData[point.rotaryTableIndex][point.heightIndex] = point.normalizedMeasuredDistance;
  }

  return measurementData;
}

function objectListRoute(req: Express.Request, res: Express.Response, next: Express.NextFunction): void {
  handleRequestRestfully(req, res, next, {
    get: async () => {
      const db = getPostgresDatabase();

      const objectList = await db.findAllObjects();
      const objectListWithMeasurementData = await Promise.all(objectList.map(async (object) => {
        const measurementData = await fetchMeasurementDataForObject(object.id);
        return { ...object, measurementData };
      }));

      res.send(objectListWithMeasurementData);
    }
  });
}

function objectByIdRoute(req: Express.Request, res: Express.Response, next: Express.NextFunction): void {
  handleRequestRestfully(req, res, next, {
    get: async () => {
      if (/^[0-9]+$/.test(req.params.objectId) == false) {
        res.status(400)
          .send({ message: 'Invalid object ID' });
        return;
      }

      const objectData = await fetchObjectFromDatabase(parseInt(req.params.objectId));
      if (objectData == null) {
        res.status(404)
          .send({ message: 'Object not found' });
        return;
      }

      res.send(objectData);
    },

    post: async () => {
      if (/^[0-9]+$/.test(req.params.objectId) == false) {
        res.status(400)
          .send({ message: 'Invalid object ID' });
        return;
      }
      const objectId = parseInt(req.params.objectId);

      Express.json()(req, res, async():Promise<void> => {
        if (req.body == null) {
          res.status(400)
            .send({ message: 'Invalid request body' });
          return;
        }

        const action = req.body.action;
        if (action != 'rename') {
          res.status(400)
            .send({ message: 'Invalid action' });
          return;
        }

        const newName = req.body.value;
        if (typeof newName != 'string' || newName.trim().length <= 0) {
          res.status(400)
            .send({ message: 'Invalid value for new name' });
          return;
        }

        const renamedSuccessfully = await getPostgresDatabase().updateObjectNameById(objectId, newName);
        if (!renamedSuccessfully) {
          res.status(404)
            .send({ message: 'Object not found' });
          return;
        }

        res.send({ success: true });
      });
    },

    delete: async (): Promise<void> => {
      if (/^[0-9]+$/.test(req.params.objectId) == false) {
        res.status(400)
          .send({ message: 'Invalid object ID' });
        return;
      }

      const objectId = parseInt(req.params.objectId);

      const deleteSuccess = await getPostgresDatabase().deleteObjectById(objectId);
      if (deleteSuccess == false) {
        res.status(404)
          .send({ message: 'Object not found' });
        return;
      }

      res.send({ success: true });
    }
  });
}

function scanStatusRoute(req: Express.Request, res: Express.Response, next: Express.NextFunction): void {
  handleRequestRestfully(req, res, next, {
    get: async (): Promise<void> => {
      res.status(501)
        .send({ message: 'Not implemented yet' });
    }
  });
}

function scanStartRoute(req: Express.Request, res: Express.Response, next: Express.NextFunction): void {
  handleRequestRestfully(req, res, next, {
    post: async (): Promise<void> => {
      res.status(501)
        .send({ message: 'Not implemented yet' });
    }
  });
}

function scanAbortRoute(req: Express.Request, res: Express.Response, next: Express.NextFunction): void {
  handleRequestRestfully(req, res, next, {
    post: async (): Promise<void> => {
      res.status(501)
        .send({ message: 'Not implemented yet' });
    }
  });
}
