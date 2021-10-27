import Neo4jProvider from "../Provider/Neo4jProvider";
import Util from "../util/Util";
import Query, { Direction } from "../Query/Query";
import Result, {
  ErrorMessages,
  inputsError,
  serverError,
} from "../Result/Result";

type _Properties = {
  [key: string]: unknown;
};

export type Relation = {
  schema: string;
  label?: string;
  id: string;
  direction?: Direction;
  hops?: string;
};

type RelationQuery = {
  id: string;
  where?: Partial<_Properties>;
};
export default class Schema<Properties> {
  static Self = "__self__";

  private _label: string;
  private _relations?: Array<Relation>;
  private _neo4jProvider: Neo4jProvider;

  private __queryLogs: boolean;
  private __checkInputs: boolean;

  constructor(
    neo4jProvider: Neo4jProvider,
    label: string,
    relations?: Array<Relation>,
    queryLogs?: boolean
  ) {
    this._label = label;
    this._relations = relations;
    this._neo4jProvider = neo4jProvider;
    this.__queryLogs = queryLogs;
    this.__checkInputs = true;
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
    where?: Partial<Properties>;
    relations?: Array<RelationQuery & { optional?: boolean }>;
  }): Promise<Result<Array<Properties>>> {
    //check inputs
    if (args?.where && !this.checkInputs(args.where)) {
      return inputsError;
    }

    const _query = new Query().match("node", this._label);

    if (args?.where) {
      Util.objectToArray(args.where, (key) => {
        _query.where("node", key, args.where[key]);
      });
    }
    let returnString = "node";
    if (args?.relations) {
      args.relations.forEach((relation, index) => {
        const currentRelation = this._relations.find(
          (rel) => rel.id === relation.id
        );
        const dstLabel = this.resolveSchema(currentRelation.schema);

        _query
          .match("node", undefined, undefined, relation.optional)
          .relation(
            undefined,
            currentRelation.label,
            currentRelation.direction || ">",
            currentRelation.hops
          )
          .node(`dst${index}`, dstLabel, relation.where);

        if (index === 0) {
          returnString += "{.*";
        }
        returnString += `, ${dstLabel}: collect(DISTINCT dst${index}{.*})`;
        if (index === args.relations.length - 1) {
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
      return new Result(Neo4jProvider.formatRecords(exeQuery), undefined);
    } catch {
      return serverError;
    }
  }

  /**
   * Create Node for Schema
   * @param args
   * @returns
   */
  async createNodes(
    nodes: Array<Properties>
  ): Promise<Result<Array<Properties>>> {
    const _query = new Query();
    let returnString = "";

    //check inputs
    for (let i = 0; i < nodes.length; i++) {
      if (!this.checkInputs(nodes[i])) {
        return inputsError;
      }

      const nodeVar = "node" + i;
      _query.create(nodeVar, this._label, nodes[i]);
      returnString += nodeVar;
      if (i < nodes.length - 1) {
        returnString += ", ";
      }
    }

    this.Logger(_query.get(), {});

    try {
      const exeQuery = await this._neo4jProvider.query(
        _query.get(returnString),
        _query.data
      );
      const result = Neo4jProvider.formatRecords(exeQuery);
      return new Result(result, undefined);
    } catch (err) {
      console.log(err);
      return serverError;
    }
  }

  /**
   *
   * @param args
   * @returns
   */
  async updateNode(args: {
    where: Partial<Properties>;
    data: Partial<Properties>;
  }): Promise<Result<Array<Properties>>> {
    const { where, data } = args;

    //check inputs
    if (where && !this.checkInputs(where)) {
      return inputsError;
    }
    if (data && !this.checkInputs(data)) {
      return inputsError;
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
      return new Result(result, undefined);
    } catch {
      return serverError;
    }
  }

  /**
   *
   * @param args
   * @returns
   */
  async deleteNodes(args: {
    where: Partial<Properties>;
  }): Promise<Result<boolean>> {
    const { where } = args;

    //check inputs
    if (where && !this.checkInputs(where)) {
      return inputsError;
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
      return new Result(confirm, undefined);
    } catch {
      return serverError;
    }
  }

  /**
   *
   * @param args
   * @returns
   */
  async createStaticRelation(args: {
    where: Partial<Properties>;
    relation: {
      label: string;
      direction: Direction;
      destination: { schema: string; where: Partial<_Properties> };
    };
  }): Promise<Result<boolean>> {
    const { where, relation } = args;

    //check inputs
    if (where && !this.checkInputs(where)) {
      return inputsError;
    }
    if (
      relation.destination.where &&
      !this.checkInputs(relation.destination.where)
    ) {
      return inputsError;
    }

    const dstLabel = this.resolveSchema(relation.destination.schema);

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
      return new Result(
        Neo4jProvider.confirmUpdate(exeQuery, "relation"),
        undefined
      );
    } catch {
      return serverError;
    }
  }

  /**
   * create a relation specified in the schema.
   * the relation is given by its id.
   * @param args
   */
  async createRelation(args: {
    where: Partial<Properties>;
    relation: RelationQuery;
  }): Promise<Result<boolean>> {
    const { where, relation } = args;

    //check inputs
    if (where && !this.checkInputs(where)) {
      return inputsError;
    }
    if (relation.where && !this.checkInputs(relation.where)) {
      return inputsError;
    }
    const currentRelation = this._relations.find((r) => r.id === relation.id);

    if (!relation) {
      throw new Error(ErrorMessages.relation);
    }
    try {
      return await this.createStaticRelation({
        where,
        relation: {
          label: currentRelation.label,
          direction: currentRelation.direction || "to",
          destination: {
            schema: currentRelation.schema,
            where: relation.where,
          },
        },
      });
    } catch {
      return serverError;
    }
  }

  /**
   * delete a relation specified in the schema.
   * @param args
   * @returns
   */
  async deleteRelation(args: {
    where?: Partial<Properties>;
    relation: RelationQuery;
  }): Promise<Result<boolean>> {
    const { relation, where } = args;
    const currentRelation = this._relations.find((r) => r.id === relation.id);
    if (!currentRelation) {
      throw new Error(ErrorMessages.relation);
    }

    const dstLabel = this.resolveSchema(currentRelation.schema);

    const _query = new Query()
      .match("src", this._label, where)
      .relation(
        "r",
        currentRelation.label,
        currentRelation.direction || "to",
        currentRelation.hops
      )
      .node("dst", dstLabel, relation.where);

    _query.delete(["r"]);

    this.Logger(_query.get(), _query.data);

    try {
      const exeQuery = await this._neo4jProvider.query(
        _query.get(),
        _query.data
      );
      return new Result(
        Neo4jProvider.confirmUpdate(exeQuery, "relation"),
        undefined
      );
    } catch {
      return serverError;
    }
  }

  /**
   * executes a match query with the given where properties
   * and responds with a server error when no nodes are found
   * @param res
   * @param where
   */
  async checkMatch(where: Partial<Properties>): Promise<boolean> {
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
   * disables input checking for the next action
   */
  noCheck() {
    this.__checkInputs = false;
    return this;
  }

  private resolveSchema(schema: string) {
    return schema === Schema.Self ? this._label : schema;
  }

  private checkRelations(
    query: Query,
    relations: Array<RelationQuery> | undefined
  ) {
    if (relations) {
      relations.forEach((rel) => {
        const currentRelation = this._relations.find((r) => r.id === rel.id);
        query
          .whereNode("node")
          .relation(
            undefined,
            currentRelation.label,
            currentRelation.direction || ">",
            currentRelation.hops
          )
          .node(undefined, currentRelation.schema, rel.where);
      });
    }
  }

  /**
   * checks input data in order to prevent cypher injections
   * @param data
   */
  private checkInputs(data: Partial<_Properties> | _Properties) {
    //const regex = new RegExp(/[{}()\[\]:;]/g); //exclude these chars
    const regex = new RegExp(/["'`]/g);
    let legal = true;

    if (this.__checkInputs)
      Object.keys(data).forEach((key: string) => {
        const currentData = String(data[key]);
        if (regex.test(currentData)) {
          console.log("illegal prop", currentData);
          legal = false;
        }
      });

    this.__checkInputs = true;
    return legal;
  }

  private Logger(query: string, data: {}) {
    if (this.__queryLogs) {
      console.log("QUERY::::::", query);
      console.log("DATA::::::", data);
    }
  }
}
