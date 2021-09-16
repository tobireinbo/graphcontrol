import Neo4jProvider from "../Provider/Neo4jProvider";
import Util from "../util/Util";
import Query, { Direction } from "./Query";
import Result, { ErrorMessages, inputsError, serverError } from "./Result";

//turns every prop of given Type in an optional one
export type Optional<Type> = {
  [Property in keyof Type]+?: Type[Property];
};

type _Properties = {
  [key: string]: unknown;
};

export type Relation = {
  schema: string;
  label: string;
  id: string;
  direction?: Direction;
  hops?: string;
};

type RelationCheck = { relationId: string; where: Optional<_Properties> };
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
    relations?: Array<{
      schema: string;
      label: string;
      id: string;
      direction?: Direction;
      hops?: string;
    }>,
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
    where?: Optional<Properties>;
    includeRelatedNodes?: boolean;
    requiredRelations?: Array<RelationCheck>;
  }): Promise<Result<Array<Properties>>> {
    //check inputs
    if (args?.where && !this.checkInputs(args.where)) {
      return inputsError;
    }

    const _query = new Query().match("node", this._label);

    this.checkRelations(_query, args.requiredRelations);

    if (args?.where) {
      Util.objectToArray(args.where, (key) => {
        _query.where("node", key, args.where[key]);
      });
    }
    let returnString = "node";
    if (args?.includeRelatedNodes) {
      this._relations.forEach((rel, index) => {
        const dstLabel = this.resolveSchema(rel.schema);

        _query
          .optionalMatch("node")
          .relation(undefined, rel.label, ">", rel.hops)
          .node(`dst${index}`, dstLabel);

        if (index === 0) {
          returnString += "{.*";
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
  async createNode(args: {
    data: Properties;
    //requiredRelations?: Array<RelationCheck>;
  }): Promise<Result<Array<Properties>>> {
    const { data } = args;

    //check inputs
    if (data && !this.checkInputs(data)) {
      return inputsError;
    }

    const _query = new Query().create("node", this._label, data);

    this.Logger(_query.get("node"), { ...data });

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
  async updateNode(args: {
    where: Optional<Properties>;
    data: Optional<Properties>;
    requiredRelations?: Array<RelationCheck>;
  }): Promise<Result<Array<Properties>>> {
    const { where, data, requiredRelations } = args;

    //check inputs
    if (where && !this.checkInputs(where)) {
      return inputsError;
    }
    if (data && !this.checkInputs(data)) {
      return inputsError;
    }

    const _query = new Query().match("node", this._label);

    this.checkRelations(_query, requiredRelations);

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
  async deleteNode(args: {
    where: Optional<Properties>;
    includeRelatedNodes?: boolean; //TO-DO
    requiredRelations?: Array<RelationCheck>;
  }): Promise<Result<boolean>> {
    const { where, requiredRelations } = args;

    //check inputs
    if (where && !this.checkInputs(where)) {
      return inputsError;
    }

    const _query = new Query().match("node", this._label);

    this.checkRelations(_query, requiredRelations);

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
    where: Optional<Properties>;
    relation: {
      label: string;
      direction: Direction;
      destination: { schema: string; where: Optional<_Properties> };
    };
    requiredRelations?: Array<RelationCheck>;
  }): Promise<Result<boolean>> {
    const { where, relation, requiredRelations } = args;

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

    this.checkRelations(_query, requiredRelations);

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
    relationId: string;
    where: Optional<Properties>;
    destinationWhere: Optional<_Properties>;
    requiredRelations?: Array<RelationCheck>;
  }): Promise<Result<boolean>> {
    const { relationId, where, destinationWhere, requiredRelations } = args;

    //check inputs
    if (where && !this.checkInputs(where)) {
      return inputsError;
    }
    if (destinationWhere && !this.checkInputs(destinationWhere)) {
      return inputsError;
    }
    const relation = this._relations.find((r) => r.id === relationId);

    if (!relation) {
      throw new Error(ErrorMessages.relation);
    }
    try {
      return await this.createStaticRelation({
        where,
        relation: {
          label: relation.label,
          direction: relation.direction || "to",
          destination: { schema: relation.schema, where: destinationWhere },
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
    relationId: string;
    where?: Optional<Properties>;
    destinationWhere?: Optional<_Properties>;
    requiredRelations?: Array<RelationCheck>;
  }): Promise<Result<boolean>> {
    const { relationId, where, destinationWhere, requiredRelations } = args;
    const currentRelation = this._relations.find((r) => r.id === relationId);
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
      .node("dst", dstLabel, destinationWhere);

    this.checkRelations(_query, requiredRelations);

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
    relations: Array<RelationCheck> | undefined
  ) {
    if (relations) {
      relations.forEach((rel) => {
        const currentRelation = this._relations.find(
          (r) => r.id === rel.relationId
        );
        query
          .whereNode("node")
          .relation(
            undefined,
            currentRelation.label,
            currentRelation.direction,
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
  private checkInputs(data: Optional<_Properties> | _Properties) {
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
