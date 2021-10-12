import { Query, Schema } from "..";
import { provider } from "../util/provider";
import Result, { ErrorMessages } from "../Result/Result";

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
  const result = await testSchema.createNodes([singleNode]);
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
  await testSchema.createNodes([
    {
      title: "first",
      uid: "f",
      rating: 3,
    },
    { title: "second", uid: "s", rating: 3 },
  ]);
});

test("create relation", async () => {
  const result = await testSchema.createRelation({
    where: { uid: "f" },
    relation: {
      id: "self rel",
      where: { uid: "s" },
    },
  });
  expect(result).toStrictEqual(new Result(true, undefined));
});

test("get multiple nodes with relations", async () => {
  const result = await testSchema.getNodes({
    relations: [{ id: "self rel", optional: true }],
  });
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
    relation: { id: "self rel", where: { uid: "s" } },
    where: { uid: "f" },
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
  const result = await testSchema.createNodes([
    { title: "test'test", uid: "12345", rating: 0 },
  ]);
  expect(result).toStrictEqual(new Result(undefined, ErrorMessages.inputs));
});

test("unchecked", async () => {
  const schema = new Schema<{ hash: string }>(provider, "Test2");
  const result = await schema.noCheck().createNodes([{ hash: "''''```" }]);

  expect(result).toStrictEqual(new Result([{ hash: "''''```" }], undefined));
});

test("get nodes with relation matches", async () => {
  const user = new Schema<{ name: string }>(
    provider,
    "AuthUser",
    undefined,
    true
  );
  const project = new Schema<{ name: string }>(
    provider,
    "Project",
    [{ id: "user", schema: "AuthUser", direction: "from", label: "ACCESS" }],
    true
  );
  await user.createNodes([{ name: "me" }]);
  await project.createNodes([{ name: "website" }, { name: "lone" }]);
  await project.createRelation({
    where: { name: "website" },
    relation: { id: "user", where: { name: "me" } },
  });

  const res = await project.getNodes({
    where: { name: "website" },
    relations: [
      {
        id: "user",
        where: { name: "me" },
        optional: true,
      },
    ],
  });

  expect(res).toStrictEqual(
    new Result([{ name: "website", AuthUser: [{ name: "me" }] }], undefined)
  );
});

afterAll(async () => {
  await provider.closeDriver();
});
