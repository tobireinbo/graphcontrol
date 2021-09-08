import neo4j from 'neo4j-driver';

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
            this._driver = neo4j.driver(this.setup.url, neo4j.auth.basic(this.setup.username, this.setup.password));
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
                        return [2 /*return*/, Neo4jProvider.formatRecords({
                                data: exeQuery,
                                keepSingleEntryInArray: true,
                            })];
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
    Neo4jProvider.formatRecords = function (args) {
        var data = args.data, keepSingleEntryInArray = args.keepSingleEntryInArray;
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
        if (formattedEntries.length < 2 && !keepSingleEntryInArray) {
            return formattedEntries[0];
        }
        return formattedEntries;
    };
    return Neo4jProvider;
}());

var ErrorMessages;
(function (ErrorMessages) {
    ErrorMessages["server"] = "Server Error";
    ErrorMessages["inputs"] = "Illegal Inputs";
    ErrorMessages["relation"] = "No such Relation";
})(ErrorMessages || (ErrorMessages = {}));
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
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var where, includeRelatedNodes, whereConstruct, optionalMatch, optionalReturn, query, exeQuery;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        where = args.where, includeRelatedNodes = args.includeRelatedNodes;
                        //check inputs
                        if (where && !Schema.checkInputs(where)) {
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        whereConstruct = where
                            ? this.whereConstructor("node", where)
                            : { query: "", data: {} };
                        optionalMatch = "";
                        optionalReturn = "";
                        if (includeRelatedNodes) {
                            (_a = this._relations) === null || _a === void 0 ? void 0 : _a.forEach(function (rel, index) {
                                if (index === 0) {
                                    optionalReturn = "{.*";
                                }
                                var dstLabel = rel.schema === Schema.Self ? _this._label : rel.schema;
                                optionalMatch += "OPTIONAL MATCH (node)-[:" + rel.label + "]->(dst" + index + ":" + dstLabel + ") ";
                                optionalReturn += ", " + dstLabel + ": collect(DISTINCT dst" + index + "{.*})";
                                if (_this._relations && index === _this._relations.length - 1) {
                                    optionalReturn += "}";
                                }
                            });
                        }
                        query = "MATCH (node:" + this._label + ") " + whereConstruct.query + " " + optionalMatch + " return node" + optionalReturn;
                        if (this.__queryLogs) {
                            console.log(query);
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(query, __assign({}, whereConstruct.data))];
                    case 2:
                        exeQuery = _c.sent();
                        return [2 /*return*/, {
                                data: Neo4jProvider.formatRecords({
                                    data: exeQuery,
                                    keepSingleEntryInArray: true,
                                }),
                                error: undefined,
                            }];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, { data: undefined, error: ErrorMessages.server }];
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
            var data, props, query, exeQuery, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        data = args.data;
                        //check inputs
                        if (data && !Schema.checkInputs(data)) {
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        props = "";
                        Schema.objectToArray(data, function (key, index, length) {
                            if (index === 0) {
                                props += "{";
                            }
                            props += key + ": $" + key;
                            if (index !== length - 1) {
                                props += ", ";
                            }
                            else {
                                props += "}";
                            }
                        });
                        query = "CREATE (node:" + this._label + " " + props + ") return node";
                        if (this.__queryLogs) {
                            console.log(query);
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(query, __assign({}, data))];
                    case 2:
                        exeQuery = _b.sent();
                        result = Neo4jProvider.formatRecords({
                            data: exeQuery,
                            keepSingleEntryInArray: true,
                        });
                        //const confirm = Neo4jProvider.confirmUpdate(exeQuery, "node");
                        return [2 /*return*/, { data: result, error: undefined }];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { data: undefined, error: ErrorMessages.server }];
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
            var where, data, setter, whereQuery, query, exeQuery, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        where = args.where, data = args.data;
                        //check inputs
                        if (where && !Schema.checkInputs(where)) {
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        if (data && !Schema.checkInputs(data)) {
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        setter = "";
                        whereQuery = "";
                        Schema.objectToArray(data, function (key, index) {
                            setter += "SET node." + key + "=$" + key + " ";
                        });
                        Schema.objectToArray(where, function (key, index, length) {
                            whereQuery += "WHERE node." + key + " = $" + key + " ";
                        });
                        query = "MATCH (node:" + this._label + ") " + whereQuery + " " + setter + " RETURN node";
                        if (this.__queryLogs) {
                            console.log(query);
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(query, __assign(__assign({}, data), where))];
                    case 2:
                        exeQuery = _b.sent();
                        result = Neo4jProvider.formatRecords({
                            data: exeQuery,
                            keepSingleEntryInArray: true,
                        });
                        //const confirm = Neo4jProvider.confirmUpdate(exeQuery, "node");
                        return [2 /*return*/, { data: result[0], error: undefined }];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { data: undefined, error: ErrorMessages.server }];
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
            var where, whereQuery, query, exeQuery, confirm_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        where = args.where;
                        //check inputs
                        if (where && !Schema.checkInputs(where)) {
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        whereQuery = "";
                        Schema.objectToArray(where, function (key) {
                            whereQuery += "WHERE node." + key + "=$" + key + " ";
                        });
                        query = "MATCH (node:" + this._label + ") " + whereQuery + " DETACH DELETE node";
                        if (this.__queryLogs) {
                            console.log(query);
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._neo4jProvider.query(query, __assign({}, where))];
                    case 2:
                        exeQuery = _b.sent();
                        confirm_1 = Neo4jProvider.confirmUpdate(exeQuery, "node");
                        return [2 /*return*/, { data: confirm_1, error: undefined }];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { data: undefined, error: ErrorMessages.server }];
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
            var where, relation, n2WhereQuery, n1WhereQuery, dstLabel, mergeQuery, query, exeQuery;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        where = args.where, relation = args.relation;
                        //check inputs
                        if (where && !Schema.checkInputs(where)) {
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        if (relation.destination.where &&
                            !Schema.checkInputs(relation.destination.where)) {
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        n2WhereQuery = this.whereConstructor("n2", relation.destination.where);
                        n1WhereQuery = this.whereConstructor("n1", where);
                        dstLabel = relation.destination.schema === Schema.Self
                            ? this._label
                            : relation.destination.schema;
                        mergeQuery = relation.direction === "to"
                            ? "-[r:" + relation.label + "]->"
                            : relation.direction === "from" && "<-[r:" + relation.label + "]-";
                        query = "MATCH (n1:" + this._label + ") " + n1WhereQuery.query + " MATCH (n2:" + dstLabel + ") " + n2WhereQuery.query + " MERGE (n1)" + mergeQuery + "(n2) return r";
                        if (this.__queryLogs) {
                            console.log(query);
                        }
                        return [4 /*yield*/, this._neo4jProvider.query(query, __assign(__assign({}, n1WhereQuery.data), n2WhereQuery.data))];
                    case 2:
                        exeQuery = _b.sent();
                        return [2 /*return*/, {
                                data: Neo4jProvider.confirmUpdate(exeQuery, "relation"),
                                error: undefined,
                            }];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, { data: undefined, error: ErrorMessages.server }];
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
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        if (destinationWhere && !Schema.checkInputs(destinationWhere)) {
                            return [2 /*return*/, { data: undefined, error: ErrorMessages.inputs }];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        relation = this._relations.find(function (r) { return r.id === relationId; });
                        if (!relation) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createStaticRelation({
                                where: where,
                                relation: {
                                    label: relation.label,
                                    direction: "to",
                                    destination: { schema: relation.schema, where: destinationWhere },
                                },
                            })];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [2 /*return*/, { data: undefined, error: ErrorMessages.relation }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, { data: undefined, error: ErrorMessages.server }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Schema.prototype.deleteRelation = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Schema.prototype.updateRelation = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    /**
     * constructs a query string and data object for a given where object
     * @param varName
     * @param where
     * @returns
     */
    Schema.prototype.whereConstructor = function (varName, where) {
        var query = "";
        var data = {};
        Schema.objectToArray(where, function (key) {
            var _a;
            query += "WHERE " + varName + "." + key + "=$" + (varName + key) + " ";
            data = __assign(__assign({}, data), (_a = {}, _a[varName + key] = where[key], _a));
        });
        return { query: query, data: data };
    };
    /**
     * executes a match query with the given where properties
     * and responds with a server error when no nodes are found
     * @param res
     * @param where
     */
    Schema.prototype.checkMatch = function (where) {
        return __awaiter(this, void 0, void 0, function () {
            var whereConstruct, query, exeQuery;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        whereConstruct = this.whereConstructor("n", where);
                        query = "match (n:" + this._label + ") " + whereConstruct.query + " return n";
                        return [4 /*yield*/, this._neo4jProvider.query(query, whereConstruct.data)];
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
        var regex = new RegExp("^([a-zA-Z0-9 .:_-]+)$"); //only allow a-z, A-Z, 0-9 and spaces, underscores, dashes
        var legal = true;
        Object.keys(data).forEach(function (key) {
            var currentData = String(data[key]);
            if (!regex.test(currentData)) {
                console.log("illegal prop", currentData);
                legal = false;
            }
        });
        return legal;
    };
    /**
     * iterate over an object. Specify the action at each step via callback function
     * @param object
     * @param cb
     */
    Schema.objectToArray = function (object, cb) {
        var dataKeysAsArray = Object.keys(object);
        var length = dataKeysAsArray.length || 0;
        dataKeysAsArray.map(function (key, index) { return cb(key, index, length); });
    };
    Schema.Self = "__self__";
    return Schema;
}());

export { Neo4jProvider, Schema };
//# sourceMappingURL=index.esm.js.map
