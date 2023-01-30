import Path from 'node:path';
import Fs from 'node:fs';

import { ConfigFile, HttpClient } from '@spraxdev/node-commons';
import { AppConfig } from './global';
import PostgresDatabase from './PostgresDatabase';

const WORKING_DIR_ROOT = Path.join(__dirname, '..', Path.sep);

let cfg: ConfigFile<AppConfig>;
let httpClient: HttpClient;
let postgresDb: PostgresDatabase;

export function getConfig(): ConfigFile<AppConfig> {
  if (cfg == null) {
    cfg = new ConfigFile<AppConfig>(Path.join(getAppConfigDir(), 'config.json'), {
      webserver: {
        host: '0.0.0.0',
        port: 8080
      },

      postgres: {
        host: 'localhost',
        port: 5432,

        username: 'objectscanner_2000',
        password: 'v3ryS3cret',
        database: 'objectscanner_2000',

        ssl: true,
        poolSize: 2
      }
    });
    cfg.saveIfChanged();
  }

  return cfg;
}

export function getHttpClient(): HttpClient {
  if (httpClient == null) {
    const packageJson = getPackageJson();

    httpClient = new HttpClient(HttpClient.generateUserAgent(
      packageJson.name ?? 'Unknown-App-Name',
      packageJson.version ?? 'Unknown-App-Version'
    ));
  }

  return httpClient;
}

export function getPostgresDatabase(): PostgresDatabase {
  if (postgresDb == null) {
    postgresDb = new PostgresDatabase(getConfig().data.postgres);
  }

  return postgresDb;
}

export function getPotentialFrontendDir(): string {
  return Path.join(WORKING_DIR_ROOT, '..', 'frontend', 'dist', Path.sep);
}

function getAppConfigDir(): string {
  return Path.join(WORKING_DIR_ROOT, 'config', Path.sep);
}

function getPackageJson(): { name?: string, version?: string } {
  const packageJsonPath = Path.join(WORKING_DIR_ROOT, 'package.json');
  if (!Fs.existsSync(packageJsonPath)) {
    return {};
  }

  return JSON.parse(Fs.readFileSync(packageJsonPath, 'utf8'));
}
