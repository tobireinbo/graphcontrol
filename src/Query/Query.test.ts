import Query from "./Query";
import { provider } from "../util/provider";

test("match", () => {
  const query = new Query();
  query.match("n", "Test", undefined, true);
  expect(query.get()).toBe("OPTIONAL MATCH (n:Test)");
});

test("match with relation", () => {
  const query = new Query();
  query
    .match("n", "Test", undefined, true)
    .relation("r", "HAS_TEST", "to")
    .node("m", "Test2");

  expect(query.get()).toBe("OPTIONAL MATCH (n:Test)-[r:HAS_TEST]->(m:Test2)");
});

test("comples", () => {
  const query = new Query();
  query
    .match("n", "Test", { title: "data" })
    .relation("r", "HAS", ">")
    .node("m", "Test2", { rating: 0 })
    .where("m", "id", "123");

  expect(query.get()).toBe(
    "MATCH (n:Test {title: $title0})-[r:HAS]->(m:Test2 {rating: $rating1}) WHERE m.id = $id2"
  );
});

test("node wheres", () => {
  const query = new Query();
  query
    .match("n")
    .whereNode("n")
    .relation("r", "HAS", "to")
    .node("m")
    .whereNode("n")
    .relation("r2", "HAS", "to")
    .node("l");

  expect(query.get()).toBe(
    "MATCH (n) WHERE (n)-[r:HAS]->(m) AND (n)-[r2:HAS]->(l)"
  );
});

test("execute", () => {
  const res = Query.execute(provider, "MATCH (n) RETURN n");
});
