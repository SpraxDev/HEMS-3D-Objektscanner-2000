import { getConfig, getPostgresDatabase } from './Constants';
import WebServer from './WebServer';

let webServer: WebServer | undefined;
let registeredShutdownHook: boolean = false;

main();

function main() {
  if (!registeredShutdownHook) {
    registeredShutdownHook = true;

    process.on('SIGTERM', shutdownHook);
    process.on('SIGINT', shutdownHook);
    process.on('SIGQUIT', shutdownHook);
    process.on('SIGHUP', shutdownHook);
  }

  webServer = new WebServer();

  const webServerHost = getConfig().data.webserver.host;
  const webServerPort = getConfig().data.webserver.port;
  const friendlyHost = webServerHost === '0.0.0.0' ? 'localhost' : webServerHost;

  webServer.listen(webServerPort, webServerHost)
    .then(() => console.log(`Webserver started on ${webServerHost}:${webServerPort} (http://${friendlyHost}:${webServerPort}/)`))
    .catch((err) => {
      console.error(err);

      shutdownHook();
    });
}

function shutdownHook() {
  console.log('Shutting down...');

  const postWebserver = async (): Promise<never> => {
    try {
      await getPostgresDatabase().shutdown();
    } catch (err) {
      console.error(err);
    } finally {
      console.log('Database handler has been shutdown.');
    }

    process.exit();
  };

  if (!webServer) {
    postWebserver()
      .catch(console.error);
    return;
  }

  webServer.shutdown()
    .then(() => console.log('WebServer shut down.'))
    .catch(console.error)
    .finally(() => {
      postWebserver()
        .catch(console.error);
    });

  webServer = undefined;
}
