export enum ErrorMessages {
  server = "Server Error",
  inputs = "Illegal Inputs",
  relation = "No such Relation",
}

export default class Result<T> {
  public data: undefined | T;
  public error: undefined | ErrorMessages;
  constructor(data: T | undefined, error: undefined | ErrorMessages) {
    this.data = data;
    this.error = error;
  }
}
