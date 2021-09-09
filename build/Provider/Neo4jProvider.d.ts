import { QueryResult } from "neo4j-driver";
export default class Neo4jProvider {
    private setup;
    private _driver;
    constructor(setup: {
        url: string | undefined;
        username: string | undefined;
        password: string | undefined;
    });
    /**
     * function for neo4j db queries
     * @param cypher
     * @param params object containing data for cypher parameters
     * @returns an object of Type QueryResult which can be formatted
     *
     */
    query(cypher: string, params: undefined | {
        [key: string]: unknown;
    }): Promise<QueryResult>;
    closeDriver(): Promise<void>;
    /**
     * formats the matched data into a d3 graph format.
     * all nodes are stored in an array while their relations are stored
     * in a seperate array where source and target nodes are determined
     * @param match cypher match query
     * @param params object containing data for cypher parameters
     * @returns
     */
    getNodesInD3FormatByMatch(args: {
        match: string;
        params: {
            [key: string]: unknown;
        };
    }): Promise<any[]>;
    /**
     * formats the matched nodes into a nested tree structure.
     * apoc is required to use this function.
     * note that the matched nodes can't have an _id property,
     * otherwise the function will not properly work since the prop name is
     * already used by apoc.
     * @param match cypher match query
     * @param params object containing data for cypher parameters
     * @returns an object containing all matched notes and their nested Nodes
     */
    getNodesInTreeFormatByMatch(args: {
        match: string;
        params?: {
            [key: string]: unknown;
        };
    }): Promise<any>;
    /**
     * confirms whether a node or relation has been update in db
     * @param data object returned by a cypher query
     * @param type check for relation or node update
     * @returns a bool that confirms the update
     */
    static confirmUpdate(data: QueryResult, type: "relation" | "node"): boolean;
    /**
     * @deprecated
     * @param data
     * @returns
     */
    static formatSingleRecordByProperties(data: QueryResult): any[];
    /**
     * formats the result of a cypher query
     * @param data object returned by query
     * @returns an array of the formatted data
     */
    static formatRecords(data: QueryResult): any[];
}
