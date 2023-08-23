import express from "express";
import { getMongoDBConnection } from "./mongodb-connector";

function connectionMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.mongoDBConnection = getMongoDBConnection();
    next();
}

export { connectionMiddleware }