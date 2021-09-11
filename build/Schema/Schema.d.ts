import Neo4jProvider from "../Provider/Neo4jProvider";
import { Direction } from "./Query";
import Result from "./Result";
declare type Optional<Type> = {
    [Property in keyof Type]+?: Type[Property];
};
declare type Copy<Type> = {
    [Property in keyof Type]: Type[Property];
};
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
        direction?: Direction;
    }>, queryLogs?: boolean);
    get label(): string;
    /**
     * get Nodes of Schema
     * @param args
     * @returns
     */
    getNodes(args?: {
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
            direction: Direction;
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
    }): Promise<Result<any>>;
    deleteRelation(args: {
        relationId: string;
        where?: Optional<Properties>;
        destinationWhere?: Optional<Properties>;
    }): Promise<Result<any>>;
    updateRelation(): Promise<void>;
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
    private Logger;
}
export {};
