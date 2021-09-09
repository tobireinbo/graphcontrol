import { Schema } from "..";

type Properties = { [key: string]: any };
type Direction = "to" | "from" | ">" | "<";

export default class Query {
  query: string;
  data: { [key: string]: unknown };
  private _lastSyntax:
    | "match"
    | "relation"
    | "where"
    | "create"
    | "node"
    | "merge"
    | "set"
    | "delete";
  constructor() {
    this.query = "";
    this.data = {};
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
      Schema.objectToArray(properties, (key, index, length) => {
        if (index === 0) props += ` {`;
        props += `${key}: $${key}`;
        if (index < length - 1) props += ", ";
        else props += "}";
      });
    this.query += `(${varName ? varName : ""}${
      label ? ":" + label : ""
    }${props})`;

    this._lastSyntax = "node";
    return this;
  }

  merge(var1, var2, relVar, relLabel, direction: Direction) {
    this.insertWhiteSpace();

    this.query += "MERGE ";
    this.node(var1).relatation(relVar, relLabel, direction).node(var2);

    this._lastSyntax = "merge";
    return this;
  }

  relatation(varName?: string, label?: string, direction?: Direction) {
    const isTo = direction === "to" || direction === ">";
    //prettier-ignore
    this.query += `${!isTo ? "<" : ""}-[${varName ? varName : ""}${label ? ":" + label : ""}]-${isTo ? ">" : ""}`;

    this._lastSyntax = "relation";
    return this;
  }

  where(varName: string, key: string, param?: string, not?: boolean) {
    this.insertWhiteSpace();

    this.query += `WHERE${not ? " NOT" : ""} ${varName}.${key} = $${
      param ? param : key
    }`;

    this._lastSyntax = "where";
    return this;
  }

  set(varName: string, key: string, param?: string) {
    this.insertWhiteSpace();

    this.query += `SET ${varName}.${key} = $${param ? param : key}`;

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

  private insertWhiteSpace() {
    if (this._lastSyntax && !(this._lastSyntax === "relation")) {
      this.query += " ";
    }
  }
}
