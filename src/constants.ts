import path from "path";
import dotenvSafe from "dotenv-safe";

dotenvSafe.config({
  path: path.resolve(__dirname, "..", ".env"),
});

export const { USER_NAME, PASSWORD, DB_NAME } = <{ [key: string]: string }>(
  process.env
);

export const __prod__ = process.env.NODE_ENV === "production";
