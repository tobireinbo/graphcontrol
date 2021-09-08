import neo4j, { Driver, QueryResult } from "neo4j-driver";

export default class Neo4jProvider {
  private _driver: Driver;
  constructor(
    private setup: {
      url: string | undefined;
      username: string | undefined;
      password: string | undefined;
    }
  ) {
    if (this.setup.url && this.setup.username && this.setup.password) {
      this._driver = neo4j.driver(
        this.setup.url,
        neo4j.auth.basic(this.setup.username, this.setup.password)
      );
    } else {
      throw new Error("credentials are undefined");
    }
  }

  /**
   * function for neo4j db queries
   * @param cypher
   * @param params object containing data for cypher parameters
   * @returns an object of Type QueryResult which can be formatted
   *
   */
  async query(
    cypher: string,
    params: undefined | { [key: string]: unknown }
  ): Promise<QueryResult> {
    const session = this._driver.session();

    try {
      const result: QueryResult = await session.run(cypher, params);
      session.close();
      return result;
    } catch (err) {
      session.close();
      console.log("Neo4j Error: ", err);
      throw err;
    }
  }

  /**
   * formats the matched data into a d3 graph format.
   * all nodes are stored in an array while their relations are stored
   * in a seperate array where source and target nodes are determined
   * @param match cypher match query
   * @param params object containing data for cypher parameters
   * @returns
   */
  async getNodesInD3FormatByMatch(args: {
    match: string;
    params: { [key: string]: unknown };
  }) {
    const { match, params } = args;
    try {
      const exeQuery = await this.query(
        `
      match query=${match}
      unwind nodes(query) as ns unwind relationships(query) as rs
      with collect( distinct {node: toString(ID(ns)),labels: labels(ns), name: toString(ns.name), _id: ns._id}) as nl, 
      collect(distinct {source: toString(ID(startNode(rs))), target: toString(ID(endNode(rs)))}) as rl
      return {nodes: nl, links: rl}
      `,
        params
      );

      return Neo4jProvider.formatRecords({
        data: exeQuery,
        keepSingleEntryInArray: true,
      });
    } catch {
      return undefined;
    }
  }

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
  async getNodesInTreeFormatByMatch(args: {
    match: string;
    params?: { [key: string]: unknown };
  }) {
    const { match, params } = args;
    try {
      const exeQuery = await this.query(
        //IMPORTANT: since apoc.toTree is working with a _id prop,
        //nodes can't have a _id prop themselves without breaking the return!!!
        //ids are instead stored in a uid prop now
        `
        MATCH path=${match}
        WITH COLLECT(DISTINCT path) as paths
        CALL apoc.convert.toTree(paths) yield value
        RETURN value
        `,
        params ? params : {}
      );

      return exeQuery.records[0].get("value");
    } catch {
      return undefined;
    }
  }

  /**
   * confirms whether a node or relation has been update in db
   * @param data object returned by a cypher query
   * @param type check for relation or node update
   * @returns a bool that confirms the update
   */
  static confirmUpdate(data: QueryResult, type: "relation" | "node"): boolean {
    const updates = data.summary.updateStatistics.updates();

    if (updates) {
      switch (type) {
        case "relation":
          if (
            updates.relationshipsCreated > 0 ||
            updates.relationshipsDeleted > 0
          ) {
            return true;
          }
          break;
        case "node":
          if (updates.nodesCreated > 0 || updates.nodesDeleted > 0) {
            return true;
          }
          break;
      }
      return false;
    } else {
      return false;
    }
  }

  /**
   * @deprecated
   * @param data
   * @returns
   */
  static formatSingleRecordByProperties(data: QueryResult) {
    const nodes = data.records;
    if (nodes) {
      const formatted = nodes.map((n) => ({
        ...n.get(0).properties,
      }));
      return formatted;
    } else {
      return [];
    }
  }

  /**
   * formats the result of a cypher query
   * @param data object returned by query
   * @returns an array of the formatted data
   */
  static formatRecords(args: {
    data: QueryResult;
    keepSingleEntryInArray: boolean;
  }) {
    const { data, keepSingleEntryInArray } = args;

    const formattedEntries = data.records.map((record) => {
      if (record.length > 1) {
        const formatted = record.forEach((f) =>
          f.properties ? { ...f.properties } : { ...f }
        );
        return formatted;
      } else {
        const formatted = record.get(0).properties
          ? { ...record.get(0).properties }
          : { ...record.get(0) };
        return formatted;
      }
    });

    if (formattedEntries.length < 2 && !keepSingleEntryInArray) {
      return formattedEntries[0];
    }
    return formattedEntries;
  }
}
