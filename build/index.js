'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var neo4j = require('neo4j-driver');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var neo4j__default = /*#__PURE__*/_interopDefaultLegacy(neo4j);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var Neo4jProvider = /** @class */ (function () {
    function Neo4jProvider(setup) {
        this.setup = setup;
        if (this.setup.url && this.setup.username && this.setup.password) {
            this._driver = neo4j__default['default'].driver(this.setup.url, neo4j__default['default'].auth.basic(this.setup.username, this.setup.password));
        }
        else {
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
    Neo4jProvider.prototype.query = function (cypher, params) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this._driver.session();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, session.run(cypher, params)];
                    case 2:
                        result = _a.sent();
                        session.close();
                        return [2 /*return*/, result];
                    case 3:
                        err_1 = _a.sent();
                        session.close();
                        console.log("Neo4j Error: ", err_1);
                        throw err_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Neo4jProvider.prototype.closeDriver = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._driver.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * formats the matched data into a d3 graph format.
     * all nodes are stored in an array while their relations are stored
     * in a seperate array where source and target nodes are determined
     * @param match cypher match query
     * @param params object containing data for cypher parameters
     * @returns
     */
    Neo4jProvider.prototype.getNodesInD3FormatByMatch = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var match, params, exeQuery;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        match = args.match, params = args.params;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.query("\n      match query=" + match + "\n      unwind nodes(query) as ns unwind relationships(query) as rs\n      with collect( distinct {node: toString(ID(ns)),labels: labels(ns), name: toString(ns.name), _id: ns._id}) as nl, \n      collect(distinct {source: toString(ID(startNode(rs))), target: toString(ID(endNode(rs)))}) as rl\n      return {nodes: nl, links: rl}\n      ", params)];
                    case 2:
                        exeQuery = _b.sent();
                        return [2 /*return*/, Neo4jProvider.formatRecords(exeQuery)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, undefined];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
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
    Neo4jProvider.prototype.getNodesInTreeFormatByMatch = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var match, params, exeQuery;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        match = args.match, params = args.params;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.query(
                            //IMPORTANT: since apoc.toTree is working with a _id prop,
                            //nodes can't have a _id prop themselves without breaking the return!!!
                            //ids are instead stored in a uid prop now
                            "\n        MATCH path=" + match + "\n        WITH COLLECT(DISTINCT path) as paths\n        CALL apoc.convert.toTree(paths) yield value\n        RETURN value\n        ", params ? params : {})];
                    case 2:
                        exeQuery = _b.sent();
                        return [2 /*return*/, exeQuery.records[0].get("value")];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, undefined];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * confirms whether a node or relation has been update in db
     * @param data object returned by a cypher query
     * @param type check for relation or node update
     * @returns a bool that confirms the update
     */
    Neo4jProvider.confirmUpdate = function (data, type) {
        var updates = data.summary.updateStatistics.updates();
        if (updates) {
            switch (type) {
                case "relation":
                    if (updates.relationshipsCreated > 0 ||
                        updates.relationshipsDeleted > 0) {
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
        }
        else {
            return false;
        }
    };
    /**
     * @deprecated
     * @param data
     * @returns
     */
    Neo4jProvider.formatSingleRecordByProperties = function (data) {
        var nodes = data.records;
        if (nodes) {
            var formatted = nodes.map(function (n) { return (__assign({}, n.get(0).properties)); });
            return formatted;
        }
        else {
            return [];
        }
    };
    /**
     * formats the result of a cypher query
     * @param data object returned by query
     * @returns an array of the formatted data
     */
    Neo4jProvider.formatRecords = function (data) {
        var formattedEntries = data.records.map(function (record) {
            if (record.length > 1) {
                var formatted = record.forEach(function (f) {
                    return f.properties ? __assign({}, f.properties) : __assign({}, f);
                });
                return formatted;
            }
            else {
                var formatted = record.get(0).properties
                    ? __assign({}, record.get(0).properties) : __assign({}, record.get(0));
                return formatted;
            }
        });
        return formattedEntries;
    };
    return Neo4jProvider;
}());

var Util = /** @class */ (function () {
    function Util() {
    }
    /**
     * iterate over an object. Specify the action at each step via callback function
     * @param object
     * @param cb
     */
    Util.objectToArray = function (object, cb) {
        var dataKeysAsArray = Object.keys(object);
        var length = dataKeysAsArray.length || 0;
        dataKeysAsArray.map(function (key, index) { return cb(key, index, length); });
    };
    return Util;
}());
var NoCheck = /** @class */ (function () {
    function NoCheck(value) {
        this.value = value;
    }
    return NoCheck;
}());

var Query = /** @class */ (function () {
    function Query() {
        this.query = "";
        this.data = {};
        this.dataKeyCounter = 0;
    }
    Query.prototype.get = function (returns) {
        if (returns) {
            return this.query + (" RETURN " + returns);
        }
        return this.query;
    };
    Query.prototype.match = function (varName, label, properties, optional) {
        this.insertWhiteSpace();
        this.query += (optional ? "OPTIONAL " : "") + "MATCH ";
        this.node(varName, label, properties);
        this._lastSyntax = "match";
        return this;
    };
    Query.prototype.optionalMatch = function (varName, label, properties) {
        this.match(varName, label, properties, true);
        return this;
    };
    Query.prototype.create = function (varName, label, properties) {
        this.insertWhiteSpace();
        this.query += "CREATE ";
        this.node(varName, label, properties);
        this._lastSyntax = "create";
        return this;
    };
    Query.prototype.node = function (varName, label, properties) {
        var _this = this;
        var props = "";
        properties &&
            Util.objectToArray(properties, function (key, index, length) {
                var dataKey = _this.addToData(key, properties[key]);
                if (index === 0)
                    props += " {";
                props += key + ": $" + dataKey;
                if (index < length - 1)
                    props += ", ";
                else
                    props += "}";
            });
        this.query += "(" + (varName ? varName : "") + (label ? ":" + label : "") + props + ")";
        this._lastSyntax = "node";
        return this;
    };
    Query.prototype.merge = function (var1, var2, relVar, relLabel, direction) {
        this.insertWhiteSpace();
        this.query += "MERGE ";
        this.node(var1).relatation(relVar, relLabel, direction).node(var2);
        this._lastSyntax = "merge";
        return this;
    };
    Query.prototype.relatation = function (varName, label, direction) {
        var isTo = direction === "to" || direction === ">";
        //prettier-ignore
        this.query += (!isTo ? "<" : "") + "-[" + (varName ? varName : "") + (label ? ":" + label : "") + "]-" + (isTo ? ">" : "");
        this._lastSyntax = "relation";
        return this;
    };
    Query.prototype.where = function (varName, key, value, not) {
        this.insertWhiteSpace();
        var dataKey = this.addToData(key, value);
        this.query += "WHERE" + (not ? " NOT" : "") + " " + varName + "." + key + " = $" + dataKey;
        this._lastSyntax = "where";
        return this;
    };
    Query.prototype.set = function (varName, key, value) {
        this.insertWhiteSpace();
        var dataKey = this.addToData(key, value);
        this.query += "SET " + varName + "." + key + " = $" + dataKey;
        this._lastSyntax = "set";
        return this;
    };
    Query.prototype.delete = function (vars, detach) {
        var _this = this;
        this.insertWhiteSpace();
        this.query += (detach ? "DETACH " : "") + "DELETE ";
        vars.forEach(function (v, index) {
            _this.query += v;
            if (index < vars.length - 1) {
                _this.query += ", ";
            }
        });
        this._lastSyntax = "delete";
        return this;
    };
    Query.prototype.addToData = function (key, value) {
        var _a;
        var _value = value;
        if (value instanceof NoCheck) {
            _value = value.value;
        }
        var uniqueKey = key + this.dataKeyCounter;
        Object.assign(this.data, (_a = {}, _a[uniqueKey] = _value, _a));
        this.dataKeyCounter++;
        return uniqueKey;
    };
    Query.prototype.insertWhiteSpace = function () {
        if (this._lastSyntax && !(this._lastSyntax === "relation")) {
            this.query += " ";
        }
    };
    return Query;
}());

var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["server"] = "Server Error";
    ErrorMessages["inputs"] = "Illegal Inputs";
    ErrorMessages["relation"] = "No such Relation";
})(ErrorMessages || (ErrorMessages = {}));
var Result = /** @class */ (function () {
    function Result(data, error) {
        this.data = data;
        this.error = error;
    }
    return Result;
}());
var serverError = new Result(undefined, ErrorMessages.server);

var Schema = /** @class */ (function () {
    function Schema(neo4jProvider, label, relations, queryLogs) {
        this._label = label;
        this._relations = relations;
        this._neo4jProvider = neo4jProvider;
        this.__queryLogs = queryLogs;
    }
    Object.defineProperty(Schema.prototype, "label", {
        get: function () {
            return this._label;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * get Nodes of Schema
     * @param args
     * @returns
     */
    Schema.prototype.getNodes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var _query, returnString, exeQuery;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        //check inputs
                        if ((args === null || args === void 0 ? void 0 : args.where) && !Schema.checkInputs(args.where)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        _query = new Query().match("node", this._label);
                        if (args === null || args === void 0 ? void 0 : args.where) {
                            Util.objectToArray(args.where, function (key) {
                                _query.where("node", key, args.where[key]);
                            });
                        }
                        returnString = "node";
                        if (args === null || args === void 0 ? void 0 : args.includeRelatedNodes) {
                            this._relations.forEach(function (rel, index) {
                                var dstLabel = rel.schema === Schema.Self ? _this._label : rel.schema;
                                _query
                                    .optionalMatch("node")
                                    .relatation(undefined, rel.label, ">")
                                    .node("dst" + index, dstLabel);
                                if (index === 0) {
                                    returnString += "{.*";
                                }
                                returnString += ", " + dstLabel + ": collect(DISTINCT dst" + index + "{.*})";
                                if (_this._relations && index === _this._relations.length - 1) {
                                    returnString += "}";
                                }
                            });
                        }
                        this.Logger(_query.get(returnString), _query.data);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(_query.get(returnString), _query.data)];
                    case 2:
                        exeQuery = _b.sent();
                        return [2 /*return*/, new Result(Neo4jProvider.formatRecords(exeQuery), undefined)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, serverError];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create Node for Schema
     * @param args
     * @returns
     */
    Schema.prototype.createNode = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var data, _query, exeQuery, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = args.data;
                        //check inputs
                        if (data && !Schema.checkInputs(data)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        _query = new Query().create("node", this._label, data);
                        this.Logger(_query.get("node"), __assign({}, data));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(_query.get("node"), _query.data)];
                    case 2:
                        exeQuery = _b.sent();
                        result = Neo4jProvider.formatRecords(exeQuery);
                        return [2 /*return*/, new Result(result, undefined)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, serverError];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param args
     * @returns
     */
    Schema.prototype.updateNode = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var where, data, _query, exeQuery, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        where = args.where, data = args.data;
                        //check inputs
                        if (where && !Schema.checkInputs(where)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        if (data && !Schema.checkInputs(data)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        _query = new Query().match("node", this._label);
                        Util.objectToArray(where, function (key) {
                            _query.where("node", key, where[key]);
                        });
                        Util.objectToArray(data, function (key) {
                            _query.set("node", key, data[key]);
                        });
                        this.Logger(_query.get("node"), __assign(__assign({}, data), where));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(_query.get("node"), _query.data)];
                    case 2:
                        exeQuery = _b.sent();
                        result = Neo4jProvider.formatRecords(exeQuery);
                        return [2 /*return*/, new Result(result, undefined)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, serverError];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param args
     * @returns
     */
    Schema.prototype.deleteNode = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var where, _query, exeQuery, confirm_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        where = args.where;
                        //check inputs
                        if (where && !Schema.checkInputs(where)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        _query = new Query().match("node", this._label);
                        Util.objectToArray(where, function (key) {
                            _query.where("node", key, where[key]);
                        });
                        _query.delete(["node"], true);
                        this.Logger(_query.get(), __assign({}, where));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(_query.get(), _query.data)];
                    case 2:
                        exeQuery = _b.sent();
                        confirm_1 = Neo4jProvider.confirmUpdate(exeQuery, "node");
                        return [2 /*return*/, new Result(confirm_1, undefined)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, serverError];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param args
     * @returns
     */
    Schema.prototype.createStaticRelation = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var where, relation, dstLabel, _query, exeQuery;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        where = args.where, relation = args.relation;
                        //check inputs
                        if (where && !Schema.checkInputs(where)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        if (relation.destination.where &&
                            !Schema.checkInputs(relation.destination.where)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        dstLabel = relation.destination.schema === Schema.Self
                            ? this._label
                            : relation.destination.schema;
                        _query = new Query();
                        _query.match("n1", this._label);
                        Util.objectToArray(where, function (key) {
                            _query.where("n1", key, where[key]);
                        });
                        _query.match("n2", dstLabel);
                        Util.objectToArray(relation.destination.where, function (key) {
                            _query.where("n2", key, relation.destination.where[key]);
                        });
                        _query.merge("n1", "n2", "r", relation.label, relation.direction);
                        this.Logger(_query.get("r"), _query.data);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(_query.get("r"), _query.data)];
                    case 2:
                        exeQuery = _b.sent();
                        return [2 /*return*/, new Result(Neo4jProvider.confirmUpdate(exeQuery, "relation"), undefined)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, serverError];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * create a relation specified in the schema.
     * the relation is given by its id.
     * @param args
     */
    Schema.prototype.createRelation = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var relationId, where, destinationWhere, relation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        relationId = args.relationId, where = args.where, destinationWhere = args.destinationWhere;
                        //check inputs
                        if (where && !Schema.checkInputs(where)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        if (destinationWhere && !Schema.checkInputs(destinationWhere)) {
                            return [2 /*return*/, new Result(undefined, ErrorMessages.inputs)];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        relation = this._relations.find(function (r) { return r.id === relationId; });
                        if (!relation) {
                            throw new Error(ErrorMessages.relation);
                        }
                        return [4 /*yield*/, this.createStaticRelation({
                                where: where,
                                relation: {
                                    label: relation.label,
                                    direction: relation.direction || "to",
                                    destination: { schema: relation.schema, where: destinationWhere },
                                },
                            })];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, serverError];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * delete a relation specified in the schema.
     * @param args
     * @returns
     */
    Schema.prototype.deleteRelation = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var relationId, where, destinationWhere, currentRelation, dstLabel, _query, exeQuery;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        relationId = args.relationId, where = args.where, destinationWhere = args.destinationWhere;
                        currentRelation = this._relations.find(function (r) { return r.id === relationId; });
                        if (!currentRelation) {
                            throw new Error(ErrorMessages.relation);
                        }
                        dstLabel = currentRelation.schema === Schema.Self
                            ? this._label
                            : currentRelation.schema;
                        _query = new Query()
                            .match("src", this._label, where)
                            .relatation("r", currentRelation.label, currentRelation.direction || "to")
                            .node("dst", dstLabel, destinationWhere);
                        _query.delete(["r"]);
                        this.Logger(_query.get(), _query.data);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(_query.get(), _query.data)];
                    case 2:
                        exeQuery = _b.sent();
                        return [2 /*return*/, new Result(Neo4jProvider.confirmUpdate(exeQuery, "relation"), undefined)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, serverError];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * executes a match query with the given where properties
     * and responds with a server error when no nodes are found
     * @param res
     * @param where
     */
    Schema.prototype.checkMatch = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            var _query_1, exeQuery;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _query_1 = new Query().match("n", this._label);
                        Util.objectToArray(where, function (key) {
                            _query_1.where("n", key, where[key]);
                        });
                        return [4 /*yield*/, this._neo4jProvider.query(_query_1.get("n"), _query_1.data)];
                    case 1:
                        exeQuery = _b.sent();
                        if (exeQuery.records.length < 1) {
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                    case 2:
                        _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * checks input data in order to prevent cypher injections
     * @param data
     */
    Schema.checkInputs = function (data) {
        var regex = new RegExp(/[{}()\[\]:;]/g); //exclude these chars
        var legal = true;
        Object.keys(data).forEach(function (key) {
            var currentData = String(data[key]);
            if (data[key] instanceof NoCheck) {
                console.log("dont check this one");
            }
            else if (regex.test(currentData)) {
                console.log("illegal prop", currentData);
                legal = false;
            }
        });
        return legal;
    };
    Schema.prototype.Logger = function (query, data) {
        if (this.__queryLogs) {
            console.log("QUERY::::::", query);
            console.log("DATA::::::", data);
        }
    };
    Schema.Self = "__self__";
    return Schema;
}());

exports.Neo4jProvider = Neo4jProvider;
exports.Query = Query;
exports.Result = Result;
exports.Schema = Schema;
//# sourceMappingURL=index.js.map
