export interface AppConfig {
  readonly remoteScannerApiUrl: string;

  readonly webserver: {
    readonly host: string;
    readonly port: number;
  }

  readonly postgres: {
    readonly host: string;
    readonly port: number;

    readonly username: string;
    readonly password: string;
    readonly database: string;

    readonly ssl: boolean;
    readonly poolSize: number;
  }
}
