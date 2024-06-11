declare module 'json-server' {
  import { Express, RequestHandler } from 'express';

  interface JSONServer {
    create(): Express;
    router(path: string): RequestHandler;
    defaults(): RequestHandler[];
  }

  const jsonServer: JSONServer;
  export default jsonServer;
}