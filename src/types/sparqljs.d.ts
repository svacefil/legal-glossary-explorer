declare module "sparqljs" {
  export class Generator {
    constructor(options?: Record<string, unknown>);
    stringify(query: object): string;
  }
}
