declare type Properties = {
    [key: string]: any;
};
export declare type Direction = "to" | "from" | ">" | "<" | "none";
export default class Query {
    private query;
    data: {
        [key: string]: unknown;
    };
    private dataKeyCounter;
    private _lastSyntax;
    constructor();
    get(returns?: string): string;
    match(varName?: string, label?: string, properties?: Properties, optional?: boolean): this;
    optionalMatch(varName?: string, label?: string, properties?: Properties): this;
    create(varName?: string, label?: string, properties?: Properties): this;
    node(varName?: string, label?: string, properties?: Properties): this;
    merge(var1: any, var2: any, relVar: any, relLabel: any, direction: Direction): this;
    relatation(varName?: string, label?: string, direction?: Direction): this;
    where(varName?: string, key?: string, value?: unknown, not?: boolean): this;
    whereNode(varName?: string): this;
    set(varName: string, key: string, value: unknown): this;
    delete(vars: Array<string>, detach?: boolean): this;
    addToData(key: string, value: unknown): string;
    private insertWhiteSpace;
}
export {};
