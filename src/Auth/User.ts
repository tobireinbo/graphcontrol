import Neo4jProvider from "../Provider/Neo4jProvider";
import Schema from "../Schema/Schema";
import crypto from "crypto";
import { v4 } from "uuid";
import { forbiddenError } from "../Result/Result";

export default class User<ExtendendProperties> {
  private _schema: Schema<any>;
  constructor(provider: Neo4jProvider) {
    this._schema = new Schema<
      {
        uuid: string;
        username: string;
        hashedPassword: string;
        salt: string;
      } & ExtendendProperties
    >(provider, "User");
  }

  async signUp(username: string, password: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = crypto.pbkdf2Sync(
      password,
      salt,
      1000,
      64,
      "sha512"
    );
    const user = await this._schema.createNodes([
      {
        data: { username, hashedPassword, uuid: v4(), salt },
      },
    ]);

    return user[0];
  }

  async signIn(username: string, password: string) {
    const user = await this._schema.getNodes({ where: { username } });
    const validPassword = this.validatePassword(
      user.data[0].salt,
      user.data[0].hashedPassword,
      password
    );

    if (validPassword) {
      return user.data[0];
    } else {
      return forbiddenError;
    }
  }

  validatePassword(salt, hashedPassword, password): boolean {
    const hashed = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512");
    return hashed === hashedPassword;
  }
}
