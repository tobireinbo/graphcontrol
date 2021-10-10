export enum ErrorMessages {
  server = "Server Error",
  inputs = "Illegal Inputs",
  relation = "No such Relation",
  forbidden = "Forbidden",
}

export default class Result<T> {
  public data: undefined | T;
  public error: undefined | ErrorMessages;
  constructor(data: T | undefined, error: undefined | ErrorMessages) {
    this.data = data;
    this.error = error;
  }
}

export const serverError = new Result(undefined, ErrorMessages.server);
export const inputsError = new Result(undefined, ErrorMessages.inputs);
export const forbiddenError = new Result(undefined, ErrorMessages.forbidden);
