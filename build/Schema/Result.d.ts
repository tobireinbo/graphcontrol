export declare enum ErrorMessages {
    server = "Server Error",
    inputs = "Illegal Inputs",
    relation = "No such Relation",
    forbidden = "Forbidden"
}
export default class Result<T> {
    data: undefined | T;
    error: undefined | ErrorMessages;
    constructor(data: T | undefined, error: undefined | ErrorMessages);
}
export declare const serverError: Result<any>;
export declare const inputsError: Result<any>;
export declare const forbiddenError: Result<any>;
