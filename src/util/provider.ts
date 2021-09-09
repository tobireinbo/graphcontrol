import Neo4jProvider from "../Provider/Neo4jProvider";

export const provider = new Neo4jProvider({
  url: "bolt://localhost:7687/",
  username: "neo4j",
  password: "password",
});
