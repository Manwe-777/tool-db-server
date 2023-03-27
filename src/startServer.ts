import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ToolDb } from "tool-db";

import ToolDbEcdsaUser from "@tool-db/ecdsa-user";
import ToolDbHybrid from "@tool-db/hybrid-network";

import dotenv from "dotenv";
import publicIp from "public-ip";

import http from "http";

dotenv.config();

// This is a bad solution but will help connecting to basically any peer
(process as any).env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

import { USE_HTTP, PORT } from "./constants";
import expressSetup from "./expressSetup";

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var allowedOrigins = ["http://localhost:3000", "http://localhost:3006"];

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (e: any, b: boolean) => void
    ) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

export default async function startServer() {
  console.log("USE_HTTP ", USE_HTTP);
  console.log("PORT ", PORT);
  publicIp.v4().then((currentIp) => {
    console.log(new Date().toUTCString());
    console.log("Server IP: ", currentIp);

    var httpServer;
    httpServer = http.createServer(app);
    httpServer.listen(80);

    const toolDb = new ToolDb({
      serverName: "manuel-server",
      httpServer: undefined,
      server: true,
      debug: true,
      host: "127.0.0.1",
      port: PORT,
      ssl: false,
      networkAdapter: ToolDbHybrid,
      userAdapter: ToolDbEcdsaUser,
    });

    // You should be able to provide your own server user or keys!
    toolDb.anonSignIn();

    // Setup Express
    expressSetup(app, toolDb);
  });
}
