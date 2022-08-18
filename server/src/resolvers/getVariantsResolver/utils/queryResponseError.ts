import { v4 as uuidv4 } from 'uuid';

export class QueryResponseError extends Error {
  code: number;
  id: string;
  source: string;

  constructor({ code, message, source }: { code: number; message: string; source: string }) {
    super();

    this.code = code;
    this.id = uuidv4();
    this.message = message;
    this.source = source;
  }
}
