// Express
import express from "express";

//MikroOrm for PostgreSQL
import { MikroORM } from "@mikro-orm/core";
import { __prod__, REDIS_SESSION_SECRET, PORT } from "./constants";
import mikroConfig from "./mikro-orm.config";

// Graphql
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";

// Graphql resolvers
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

// Redis
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  redisClient
    .on("error", (err) => {
      console.log("Redis error: ", err);
    })
    .on("message", (message) => {
      console.log("Redis message: ", message);
    });

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years because why not
        httpOnly: true,
        secure: __prod__, //cookie only work in https
        sameSite: "lax", // csrf
      },
      saveUninitialized: false,
      secret: REDIS_SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log("server started on localhost: ", PORT);
  });
};

main().catch((err) => console.error(err));