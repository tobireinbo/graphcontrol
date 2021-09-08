import Neo4jProvider from "../Provider/Neo4jProvider";
declare type Optional<Type> = {
    [Property in keyof Type]+?: Type[Property];
};
declare type Copy<Type> = {
    [Property in keyof Type]: Type[Property];
};
export declare type Result<T> = {
    error: undefined | ErrorMessages;
    data: undefined | T;
};
export declare enum ErrorMessages {
    server = "Server Error",
    inputs = "Illegal Inputs",
    relation = "No such Relation"
}
export default class Schema<Properties = {
    [key: string]: unknown;
}> {
    static Self: string;
    private _label;
    private _relations?;
    private _neo4jProvider;
    private __queryLogs;
    constructor(neo4jProvider: Neo4jProvider, label: string, relations?: Array<{
        schema: string;
        label: string;
        id: string;
    }>, queryLogs?: boolean);
    get label(): string;
    /**
     * get Nodes of Schema
     * @param args
     * @returns
     */
    getNodes(args: {
        where?: Optional<Properties>;
        includeRelatedNodes?: boolean;
    }): Promise<Result<Array<Properties>>>;
    /**
     * Create Node for Schema
     * @param args
     * @returns
     */
    createNode(args: {
        data: Copy<Properties>;
    }): Promise<Result<Array<Properties>>>;
    /**
     *
     * @param args
     * @returns
     */
    updateNode(args: {
        where: Optional<Properties>;
        data: Optional<Properties>;
    }): Promise<Result<Array<Properties>>>;
    /**
     *
     * @param args
     * @returns
     */
    deleteNode(args: {
        where: Optional<Properties>;
    }): Promise<Result<boolean>>;
    /**
     *
     * @param args
     * @returns
     */
    createStaticRelation(args: {
        where: Optional<Properties>;
        relation: {
            label: string;
            direction: "to" | "from";
            destination: {
                schema: string;
                where: Optional<Properties>;
            };
        };
    }): Promise<Result<boolean>>;
    /**
     * create a relation specified in the schema.
     * the relation is given by its id.
     * @param args
     */
    createRelation(args: {
        relationId: string;
        where: Optional<Properties>;
        destinationWhere: Optional<Properties>;
    }): Promise<Result<boolean>>;
    deleteRelation(): Promise<void>;
    updateRelation(): Promise<void>;
    /**
     * constructs a query string and data object for a given where object
     * @param varName
     * @param where
     * @returns
     */
    private whereConstructor;
    /**
     * executes a match query with the given where properties
     * and responds with a server error when no nodes are found
     * @param res
     * @param where
     */
    checkMatch(where: Optional<Properties>): Promise<boolean>;
    /**
     * checks input data in order to prevent cypher injections
     * @param data
     */
    private static checkInputs;
    /**
     * iterate over an object. Specify the action at each step via callback function
     * @param object
     * @param cb
     */
    static objectToArray(object: {
        [key: string]: unknown;
    }, cb: (key: string, index: number, length: number) => void): void;
}
export {};
