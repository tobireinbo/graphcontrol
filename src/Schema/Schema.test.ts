import { Schema } from "..";
import { provider } from "../util/provider";
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

test("get multiple nodes", async () => {
  const result = await testSchema.getNodes();
  expect(result).toStrictEqual(
    new Result(
      [
        { title: "first", uid: "f", rating: 3 },
        { title: "second", uid: "s", rating: 3 },
      ],
      undefined
    )
  );
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

afterAll(async () => {
  await provider.closeDriver();
});
