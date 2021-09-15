import { Query, Schema } from "..";
import { provider } from "../util/provider";
import { NoCheck } from "../util/Util";
import Result, { ErrorMessages } from "./Result";

const testSchema = new Schema<{ uid: string; title: string; rating: number }>(
  provider,
  "Test",
  [{ schema: Schema.Self, label: "HAS_TEST", id: "self rel" }],
  true
);

const singleNode = { title: "hello", rating: 2, uid: "123abc" };

test("(setup) clear db", async () => {
  await provider.query("match (n) detach delete n", {});
});

test("create node", async () => {
  const result = await testSchema.createNode({
    data: singleNode,
  });
  expect(result).toStrictEqual(new Result([singleNode], undefined));
});

test("update node", async () => {
  const result = await testSchema.updateNode({
    where: { uid: "123abc" },
    data: { rating: 5 },
  });
  expect(result).toStrictEqual(
    new Result([{ ...singleNode, rating: 5 }], undefined)
  );
});

test("get single node", async () => {
  const result = await testSchema.getNodes({ where: { uid: "123abc" } });
  expect(result).toStrictEqual(
    new Result([{ ...singleNode, rating: 5 }], undefined)
  );
});

test("delete node", async () => {
  const result = await testSchema.deleteNode({ where: { uid: "123abc" } });
  expect(result).toStrictEqual(new Result(true, undefined));
});

test("(setup) create multiple nodes", async () => {
  await testSchema.createNode({
    data: { title: "first", uid: "f", rating: 3 },
  });
  await testSchema.createNode({
    data: { title: "second", uid: "s", rating: 3 },
  });
});

test("create relation", async () => {
  const result = await testSchema.createRelation({
    relationId: "self rel",
    where: { uid: "f" },
    destinationWhere: { uid: "s" },
  });
  expect(result).toStrictEqual(new Result(true, undefined));
});

test("get multiple nodes with relations", async () => {
  const result = await testSchema.getNodes({ includeRelatedNodes: true });
  expect(result).toStrictEqual(
    new Result(
      [
        {
          title: "first",
          uid: "f",
          rating: 3,
          Test: [{ title: "second", uid: "s", rating: 3 }],
        },
        { title: "second", uid: "s", rating: 3, Test: [] },
      ],
      undefined
    )
  );
});

test("delete relation", async () => {
  const result = await testSchema.deleteRelation({
    relationId: "self rel",
    where: { uid: "f" },
    destinationWhere: { uid: "s" },
  });
  expect(result).toStrictEqual(new Result(true, undefined));
});

test("delete multiple nodes", async () => {
  const result = await testSchema.deleteNode({ where: { rating: 3 } });
  expect(result).toStrictEqual(new Result(true, undefined));
  const checkDeletion = await testSchema.getNodes({ where: { rating: 3 } });
  expect(checkDeletion).toStrictEqual(new Result([], undefined));
});

test("illegal inputs", async () => {
  const result = await testSchema.createNode({
    data: { title: "}-[:HAS_NODE]->(z) RETURN z", uid: "12345", rating: 0 },
  });
  expect(result).toStrictEqual(new Result(undefined, ErrorMessages.inputs));
});

test("unchecked", async () => {
  const schema = new Schema<{ hash: NoCheck<string> }>(provider, "Test2");
  const result = await schema.createNode({
    data: { hash: new NoCheck("907wv.-7#58902))<{3?") },
  });

  expect(result).toStrictEqual(
    new Result([{ hash: "907wv.-7#58902))<{3?" }], undefined)
  );
});

afterAll(async () => {
  await provider.closeDriver();
});
