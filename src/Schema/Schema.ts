import Neo4jProvider from "../Provider/Neo4jProvider";
import Util from "../util/Util";
import Query from "./Query";

//turns every prop of given Type in an optional one
type Optional<Type> = {
  [Property in keyof Type]+?: Type[Property];
};
type Copy<Type> = {
  [Property in keyof Type]: Type[Property];
};

export type Result<T> = {
  error: undefined | ErrorMessages;
  data: undefined | T;
};

export enum ErrorMessages {
  server = "Server Error",
  inputs = "Illegal Inputs",
  relation = "No such Relation",
}

type _Properties = {
  [key: string]: unknown;
};

export default class Schema<Properties = { [key: string]: unknown }> {
  static Self = "__self__";

  private _label: string;
  private _relations?: Array<{ schema: string; label: string; id: string }>;
  private _neo4jProvider: Neo4jProvider;

  private __queryLogs: boolean;

  constructor(
    neo4jProvider: Neo4jProvider,
    label: string,
    relations?: Array<{ schema: string; label: string; id: string }>,
    queryLogs?: boolean
  ) {
    this._label = label;
    this._relations = relations;
    this._neo4jProvider = neo4jProvider;
    this.__queryLogs = queryLogs;
  }

  get label() {
    return this._label;
  }

  /**
   * get Nodes of Schema
   * @param args
   * @returns
   */
  async getNodes(args?: {
    where?: Optional<Properties>;
    includeRelatedNodes?: boolean;
  }): Promise<Result<Array<Properties>>> {
    //check inputs
    if (args?.where && !Schema.checkInputs(args.where)) {
      return { data: undefined, error: ErrorMessages.inputs };
    }

    const _query = new Query().match("node", this._label);

    if (args?.where) {
      Util.objectToArray(args.where, (key) => {
        _query.where("node", key, args.where[key]);
      });
    }
    let returnString = "node";
    if (args?.includeRelatedNodes) {
      this._relations.forEach((rel, index) => {
        const dstLabel = rel.schema === Schema.Self ? this._label : rel.schema;

        _query
          .optionalMatch("node")
          .relatation(undefined, rel.label, ">")
          .node(`dst${index}`, dstLabel);

        if (index === 0) {
          returnString = "{.*";
        }
        returnString += `, ${dstLabel}: collect(DISTINCT dst${index}{.*})`;
        if (this._relations && index === this._relations.length - 1) {
          returnString += "}";
        }
      });
    }

    this.Logger(_query.get(returnString), _query.data);

    try {
      const exeQuery = await this._neo4jProvider.query(
        _query.get(returnString),
        _query.data
      );

      return {
        data: Neo4jProvider.formatRecords(exeQuery),
        error: undefined,
      };
    } catch {
      return { data: undefined, error: ErrorMessages.server };
    }
  }

  /**
   * Create Node for Schema
   * @param args
   * @returns
   */
  async createNode(args: {
    data: Copy<Properties>;
  }): Promise<Result<Array<Properties>>> {
    const { data } = args;

    //check inputs
    if (data && !Schema.checkInputs(data)) {
      return { data: undefined, error: ErrorMessages.inputs };
    }

    const _query = new Query().create("node", this._label, data);

    this.Logger(_query.get("node"), { ...data });

    try {
      const exeQuery = await this._neo4jProvider.query(
        _query.get("node"),
        _query.data
      );
      const result = Neo4jProvider.formatRecords(exeQuery);
      return { data: result, error: undefined };
    } catch {
      return { data: undefined, error: ErrorMessages.server };
    }
  }

  /**
   *
   * @param args
   * @returns
   */
  async updateNode(args: {
    where: Optional<Properties>;
    data: Optional<Properties>;
  }): Promise<Result<Array<Properties>>> {
    const { where, data } = args;

    //check inputs
    if (where && !Schema.checkInputs(where)) {
      return { data: undefined, error: ErrorMessages.inputs };
    }
    if (data && !Schema.checkInputs(data)) {
      return { data: undefined, error: ErrorMessages.inputs };
    }

    const _query = new Query().match("node", this._label);
    Util.objectToArray(where, (key) => {
      _query.where("node", key, where[key]);
    });
    Util.objectToArray(data, (key) => {
      _query.set("node", key, data[key]);
    });

    this.Logger(_query.get("node"), { ...data, ...where });

    try {
      const exeQuery = await this._neo4jProvider.query(
        _query.get("node"),
        _query.data
      );
      const result = Neo4jProvider.formatRecords(exeQuery);
      //const confirm = Neo4jProvider.confirmUpdate(exeQuery, "node");
      return { data: result, error: undefined };
    } catch {
      return { data: undefined, error: ErrorMessages.server };
    }
  }

  /**
   *
   * @param args
   * @returns
   */
  async deleteNode(args: {
    where: Optional<Properties>;
  }): Promise<Result<boolean>> {
    const { where } = args;

    //check inputs
    if (where && !Schema.checkInputs(where)) {
      return { data: undefined, error: ErrorMessages.inputs };
    }

    const _query = new Query().match("node", this._label);

    Util.objectToArray(where, (key) => {
      _query.where("node", key, where[key]);
    });
    _query.delete(["node"], true);

    this.Logger(_query.get(), { ...where });

    try {
      const exeQuery = await this._neo4jProvider.query(
        _query.get(),
        _query.data
      );

      const confirm = Neo4jProvider.confirmUpdate(exeQuery, "node");
      return { data: confirm, error: undefined };
    } catch {
      return { data: undefined, error: ErrorMessages.server };
    }
  }

  /**
   *
   * @param args
   * @returns
   */
  async createStaticRelation(args: {
    where: Optional<Properties>;
    relation: {
      label: string;
      direction: "to" | "from";
      destination: { schema: string; where: Optional<Properties> };
    };
  }): Promise<Result<boolean>> {
    const { where, relation } = args;

    //check inputs
    if (where && !Schema.checkInputs(where)) {
      return { data: undefined, error: ErrorMessages.inputs };
    }
    if (
      relation.destination.where &&
      !Schema.checkInputs(relation.destination.where)
    ) {
      return { data: undefined, error: ErrorMessages.inputs };
    }

    const dstLabel =
      relation.destination.schema === Schema.Self
        ? this._label
        : relation.destination.schema;

    const _query = new Query();

    _query.match("n1", this._label);
    Util.objectToArray(where, (key) => {
      _query.where("n1", key, where[key]);
    });

    _query.match("n2", dstLabel);
    Util.objectToArray(relation.destination.where, (key) => {
      _query.where("n2", key, relation.destination.where[key]);
    });

    _query.merge("n1", "n2", "r", relation.label, relation.direction);

    this.Logger(_query.get("r"), _query.data);

    try {
      const exeQuery = await this._neo4jProvider.query(
        _query.get("r"),
        _query.data
      );
      return {
        data: Neo4jProvider.confirmUpdate(exeQuery, "relation"),
        error: undefined,
      };
    } catch {
      return { data: undefined, error: ErrorMessages.server };
    }
  }

  /**
   * create a relation specified in the schema.
   * the relation is given by its id.
   * @param args
   */
  async createRelation(args: {
    relationId: string;
    where: Optional<Properties>;
    destinationWhere: Optional<Properties>;
  }) {
    const { relationId, where, destinationWhere } = args;

    //check inputs
    if (where && !Schema.checkInputs(where)) {
      return { data: undefined, error: ErrorMessages.inputs };
    }
    if (destinationWhere && !Schema.checkInputs(destinationWhere)) {
      return { data: undefined, error: ErrorMessages.inputs };
    }
    try {
      const relation = this._relations.find((r) => r.id === relationId);

      if (relation) {
        return await this.createStaticRelation({
          where,
          relation: {
            label: relation.label,
            direction: "to",
            destination: { schema: relation.schema, where: destinationWhere },
          },
        });
      } else {
        return { data: undefined, error: ErrorMessages.relation };
      }
    } catch {
      return { data: undefined, error: ErrorMessages.server };
    }
  }

  async deleteRelation() {}

  async updateRelation() {}

  /**
   * constructs a query string and data object for a given where object
   * @deprecated
   * @param varName
   * @param where
   * @returns
   */
  private whereConstructor(
    query: Query,
    varName: string,
    where: Optional<Properties>
  ): { [key: string]: unknown } {
    let data = {};
    where &&
      Util.objectToArray(where, (key) => {
        query.where(varName, key, varName + key);
        data = {
          ...data,
          //@ts-ignore
          [varName + key]: where[key],
        };
      });
    return data;
  }

  /**
   * executes a match query with the given where properties
   * and responds with a server error when no nodes are found
   * @param res
   * @param where
   */
  async checkMatch(where: Optional<Properties>): Promise<boolean> {
    try {
      const _query = new Query().match("n", this._label);
      Util.objectToArray(where, (key) => {
        _query.where("n", key, where[key]);
      });
      const exeQuery = await this._neo4jProvider.query(
        _query.get("n"),
        _query.data
      );
      if (exeQuery.records.length < 1) {
        return false;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * checks input data in order to prevent cypher injections
   * @param data
   */
  private static checkInputs(data: Optional<_Properties> | _Properties) {
    const regex = new RegExp(/[{}()\[\]:;]/g); //exclude these chars
    let legal = true;

    Object.keys(data).forEach((key: string) => {
      const currentData = String(data[key]);
      if (regex.test(currentData)) {
        console.log("illegal prop", currentData);
        legal = false;
      }
    });

    return legal;
  }

  private Logger(query: string, data: {}) {
    if (this.__queryLogs) {
      console.log("QUERY::::::", query);
      console.log("DATA::::::", data);
    }
  }
}
