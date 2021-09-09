import { Schema } from "..";
import { Neo4jProvider } from "..";
import { provider } from "../util/provider";
import { ErrorMessages } from "./Schema";

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
  expect(result).toStrictEqual({
    data: [singleNode],
    error: undefined,
  });
});

test("update node", async () => {
  const result = await testSchema.updateNode({
    where: { uid: "123abc" },
    data: { rating: 5 },
  });
  expect(result).toStrictEqual({
    data: [{ ...singleNode, rating: 5 }],
    error: undefined,
  });
});

test("get single node", async () => {
  const result = await testSchema.getNodes({ where: { uid: "123abc" } });
  expect(result).toStrictEqual({
    data: [{ ...singleNode, rating: 5 }],
    error: undefined,
  });
});

test("delete node", async () => {
  const result = await testSchema.deleteNode({ where: { uid: "123abc" } });
  expect(result).toStrictEqual({ data: true, error: undefined });
});

test("(setup) create multiple nodes", async () => {
  await testSchema.createNode({
    data: { title: "first", uid: "f", rating: 3 },
  });
  await testSchema.createNode({
    data: { title: "second", uid: "s", rating: 3 },
  });
});

test("get multiple nodes", async () => {
  const result = await testSchema.getNodes();
  expect(result).toStrictEqual({
    data: [
      { title: "first", uid: "f", rating: 3 },
      { title: "second", uid: "s", rating: 3 },
    ],
    error: undefined,
  });
});

test("delete multiple nodes", async () => {
  const result = await testSchema.deleteNode({ where: { rating: 3 } });
  expect(result).toStrictEqual({ data: true, error: undefined });
  const checkDeletion = await testSchema.getNodes({ where: { rating: 3 } });
  expect(checkDeletion).toStrictEqual({ data: [], error: undefined });
});

test("illegal inputs", async () => {
  const result = await testSchema.createNode({
    data: { title: "}-[:HAS_NODE]->(z) RETURN z", uid: "12345", rating: 0 },
  });
  expect(result).toStrictEqual({
    data: undefined,
    error: ErrorMessages.inputs,
  });
});

afterAll(async () => {
  await provider.closeDriver();
});
