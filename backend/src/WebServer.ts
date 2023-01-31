import Fs from 'node:fs';
import * as Http from 'node:http';

import Express from 'express';
import { createApiRouter } from './ApiRouter';
import { getPotentialFrontendDir } from './Constants';
import { statusRoute } from './StatusRoute';

export default class WebServer {
  protected app: Express.Application;
  protected server?: Http.Server;

  constructor() {
    this.app = Express();

    this.app.disable('x-powered-by');
    this.app.set('etag', false);

    this.app.use('/api', createApiRouter());
    this.app.use('/status', statusRoute);

    const frontendPath = getPotentialFrontendDir();
    if (Fs.existsSync(frontendPath)) {
      this.app.use('/', Express.static(frontendPath, { etag: true, maxAge: '30min' }));
    } else {
      this.app.use(['/', '/index.html'], (req, res, next): void => {
        if (req.path !== '/' && req.path !== '/index.html') {
          return next();
        }

        res.status(404)
          .type('text/html')
          .send('<h1>404 Not Found</h1>\n<p>Das Frontend wurde beim Start nicht gefunden und ist daher nicht verfügbar.</p>');
      });

      console.warn(`\n[WARN] Das Frontend wurde nicht unter dem Pfad '${frontendPath}' gefunden – Es wird daher nicht bereitgestellt.\n`);
    }

    this.setupErrorHandling();
  }

  async listen(port: number, host?: string): Promise<void> {
    return new Promise((resolve) => {
      this.shutdown();

      this.server = this.app.listen(port, host ?? '127.0.0.1', () => resolve());
    });
  }

  async shutdown(): Promise<void> {
    if (this.server == null) {
      return;
    }

    return new Promise((resolve) => {
      this.server?.close(() => {
        this.server = undefined;
        resolve();
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((req, res, next) => {
      res.status(404)
        .type('text/html')
        .send('<h1>404 Not Found</h1>');
    });

    this.app.use((err: any, req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      console.error(err);

      res.status(500)
        .type('text/plain')
        .send(`${err.message}\n\n${err.stack}`);
    });
  }
}
