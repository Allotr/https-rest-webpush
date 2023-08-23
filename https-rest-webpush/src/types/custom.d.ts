import { UserDbObject } from "allotr-graphql-schema-types";
import { MongoDBSingleton } from "../utils/mongodb-connector";
import { RedisSingleton } from "../utils/redis-connector";

declare module "express-serve-static-core" {
    interface Request {
        mongoDBConnection: Promise<{ connection: Promise<MongoClient>, db: Promise<Db> }>;
        user: UserDbObject;
    }
}
