import Neo4jProvider from "../Provider/Neo4jProvider";
import { Direction } from "./Query";
import Result from "./Result";
export declare type Optional<Type> = {
    [Property in keyof Type]+?: Type[Property];
};
declare type _Properties = {
    [key: string]: unknown;
};
declare type RelationCheck = {
    relationId: string;
    where: Optional<_Properties>;
};
export default class Schema<Properties> {
    static Self: string;
    private _label;
    private _relations?;
    private _neo4jProvider;
    private __queryLogs;
    private __checkInputs;
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
        requiredRelations?: Array<RelationCheck>;
    }): Promise<Result<Array<Properties>>>;
    /**
     * Create Node for Schema
     * @param args
     * @returns
     */
    createNode(args: {
        data: Properties;
        requiredRelations?: Array<RelationCheck>;
    }): Promise<Result<Array<Properties>>>;
    /**
     *
     * @param args
     * @returns
     */
    updateNode(args: {
        where: Optional<Properties>;
        data: Optional<Properties>;
        requiredRelations?: Array<RelationCheck>;
    }): Promise<Result<Array<Properties>>>;
    /**
     *
     * @param args
     * @returns
     */
    deleteNode(args: {
        where: Optional<Properties>;
        includeRelatedNodes?: boolean;
        relations?: Array<RelationCheck>;
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
                where: Optional<_Properties>;
            };
        };
        requiredRelations?: Array<RelationCheck>;
    }): Promise<Result<boolean>>;
    /**
     * create a relation specified in the schema.
     * the relation is given by its id.
     * @param args
     */
    createRelation(args: {
        relationId: string;
        where: Optional<Properties>;
        destinationWhere: Optional<_Properties>;
        requiredRelations?: Array<RelationCheck>;
    }): Promise<Result<boolean>>;
    /**
     * delete a relation specified in the schema.
     * @param args
     * @returns
     */
    deleteRelation(args: {
        relationId: string;
        where?: Optional<Properties>;
        destinationWhere?: Optional<_Properties>;
        requiredRelations?: Array<RelationCheck>;
    }): Promise<Result<any>>;
    /**
     * executes a match query with the given where properties
     * and responds with a server error when no nodes are found
     * @param res
     * @param where
     */
    checkMatch(where: Optional<Properties>): Promise<boolean>;
    /**
     * disables input checking for the next action
     */
    noCheck(): this;
    private resolveSchema;
    private checkRelations;
    /**
     * checks input data in order to prevent cypher injections
     * @param data
     */
    private checkInputs;
    private Logger;
}
export {};
