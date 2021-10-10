import Neo4jProvider from "../Provider/Neo4jProvider";
export default class User<ExtendendProperties> {
    private _schema;
    constructor(provider: Neo4jProvider);
    signUp(username: string, password: string): Promise<import("../Schema/Result").default<any[]>>;
    signIn(username: string, password: string): Promise<any>;
    validatePassword(salt: any, hashedPassword: any, password: any): boolean;
}
