import Neo4jProvider from "../Provider/Neo4jProvider";
import Result, { ErrorMessages, serverError } from "../Result/Result";
import Util from "../util/Util";

type Properties = { [key: string]: any };
export type Direction = "to" | "from" | ">" | "<" | "none";

export default class Query {
  private query: string;
  private partitionedQuery: [string, string, string, string]; //match/where, create, merge, return
  data: { [key: string]: unknown };
  private dataKeyCounter: number;
  private _lastSyntax:
    | "match"
    | "where"
    | "create"
    | "merge"
    | "set"
    | "delete";

  constructor() {
    this.query = "";
    this.data = {};
    this.dataKeyCounter = 0;
  }

  static async execute(
    provider: Neo4jProvider,
    query: string,
    params?: any
  ): Promise<Result<any>> {
    try {
      const exeQuery = await provider.query(query, params);
      const formatted = Neo4jProvider.formatRecords(exeQuery);

      return new Result(formatted, undefined);
    } catch (err) {
      return serverError;
    }
  }

  get(returns?: string) {
    if (returns) {
      return this.query + ` RETURN ${returns}`;
    }
    return this.query;
  }

  match(
    varName?: string,
    label?: string,
    properties?: Properties,
    optional?: boolean
  ) {
    this.insertWhiteSpace();

    this.query += `${optional ? "OPTIONAL " : ""}MATCH `;
    this.node(varName, label, properties);

    this._lastSyntax = "match";
    return this;
  }

  optionalMatch(varName?: string, label?: string, properties?: Properties) {
    this.match(varName, label, properties, true);
    return this;
  }

  create(varName?: string, label?: string, properties?: Properties) {
    this.insertWhiteSpace();

    this.query += `CREATE `;
    this.node(varName, label, properties);

    this._lastSyntax = "create";
    return this;
  }

  node(varName?: string, label?: string, properties?: Properties) {
    let props = "";
    properties &&
      Util.objectToArray(properties, (key, index, length) => {
        const dataKey = this.addToData(key, properties[key]);
        if (index === 0) props += ` {`;
        props += `${key}: $${dataKey}`;
        if (index < length - 1) props += ", ";
        else props += "}";
      });
    this.query += `(${varName ? varName : ""}${
      label ? ":" + label : ""
    }${props})`;

    return this;
  }

  merge(var1, var2, relVar, relLabel, direction: Direction) {
    this.insertWhiteSpace();

    this.query += "MERGE ";
    this.node(var1).relation(relVar, relLabel, direction).node(var2);

    this._lastSyntax = "merge";
    return this;
  }

  relation(
    varName?: string,
    label?: string,
    direction?: Direction,
    hops?: string
  ) {
    const isTo = direction === "to" || direction === ">";
    const isNone = direction === "none";
    //prettier-ignore
    this.query += `${!isTo && !isNone  ? "<" : ""}-[${varName ? varName : ""}${label ? ":" + label : ""}${hops ? hops : ""}]-${isTo && !isNone? ">" : ""}`;

    return this;
  }

  where(varName?: string, key?: string, value?: unknown, not?: boolean) {
    this.insertWhiteSpace();

    const syntax = this._lastSyntax === "where" ? "AND" : "WHERE";

    const dataKey = this.addToData(key, value);
    this.query += `${syntax}${
      not ? " NOT" : ""
    } ${varName}.${key} = $${dataKey}`;

    this._lastSyntax = "where";
    return this;
  }

  whereNode(varName?: string) {
    this.insertWhiteSpace();

    const syntax = this._lastSyntax === "where" ? "AND" : "WHERE";

    this.query += `${syntax} (${varName})`;

    this._lastSyntax = "where";
    return this;
  }

  set(varName: string, key: string, value: unknown) {
    this.insertWhiteSpace();

    const dataKey = this.addToData(key, value);
    this.query += `SET ${varName}.${key} = $${dataKey}`;

    this._lastSyntax = "set";
    return this;
  }
  delete(vars: Array<string>, detach?: boolean) {
    this.insertWhiteSpace();

    this.query += `${detach ? "DETACH " : ""}DELETE `;
    vars.forEach((v, index) => {
      this.query += v;
      if (index < vars.length - 1) {
        this.query += ", ";
      }
    });

    this._lastSyntax = "delete";
    return this;
  }

  addToData(key: string, value: unknown) {
    const uniqueKey = key + this.dataKeyCounter;
    Object.assign(this.data, { [uniqueKey]: value });
    this.dataKeyCounter++;
    return uniqueKey;
  }

  private insertWhiteSpace() {
    if (this._lastSyntax) this.query += " ";
  }
}