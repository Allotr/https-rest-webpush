import express from "express";
import { getLoadedEnvVariables } from "../utils/env-loader";
import { UserDbObject, UserWhitelistDbObject, GlobalRole } from "allotr-graphql-schema-types";
import { ObjectId } from "mongodb"

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import MongoStore from 'connect-mongo';
import { USERS, USER_WHITELIST } from "../consts/collections";
import { getMongoDBConnection } from "../utils/mongodb-connector";
import { getBooleanByString } from "../utils/data-util";

const cors = require('cors');

function isLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}



function initializeGooglePassport(app: express.Express) {
    const {
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL,
        MONGO_DB_ENDPOINT,
        SESSION_SECRET,
        WHITELIST_MODE
    } = getLoadedEnvVariables();
    const corsOptions = {
        origin: (origin, next) => {
            // Test for main domain and all subdomains
            if (origin == null || origin === 'https://allotr.eu' || /^https:\/\/\w+?\.allotr\.eu$/gm.test(origin)) {
                next(null, true)
            } else {
                next(new Error('Not allowed by CORS'))
            }
        },
        credentials: true // <-- REQUIRED backend setting
    };

    const sessionMiddleware = session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { domain: '.allotr.eu', maxAge: 30 * 24 * 60 * 60 * 1000 },
        store: new MongoStore({ mongoUrl: MONGO_DB_ENDPOINT }),
    })

    const passportMiddleware = passport.initialize();
    const passportSessionMiddleware = passport.session();

    app.use(cors(corsOptions));

    app.use(sessionMiddleware)
    app.use(passportMiddleware)
    app.use(passportSessionMiddleware)

   
    passport.serializeUser<ObjectId>((user: any, done) => {
        done(null, user._id);
    });

    passport.deserializeUser<ObjectId>(async (id, done) => {
        try {
            const db = await (await getMongoDBConnection()).db;
            const idToSearch = new ObjectId(id);
            const user = await db.collection<UserDbObject>(USERS).findOne({ _id: idToSearch });
            done(null, user);
        } catch (e) {
            console.log("error deserializing user", e);
        }
    });

}
export { initializeGooglePassport, isLoggedIn }