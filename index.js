import path from "path";

import http from "http";
import express from "express";
const app = express()

const __dirname = path.resolve();

http.createServer(app).listen(3000);

app.use("/shared", express.static(__dirname + "/shared"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/buf", (req, res) => {
    req.setEncoding("binary");

    const chunks = [];

    req.on("data", chunk => {
        chunks.push(Buffer.from(chunk, "binary"));
    });

    req.on("end", () => {
        const buf = Buffer.concat(chunks);
        const view = new Uint8Array(buf);
        console.log(view);
        const user = User.prototype.from(buf);
        console.log(user);
        res.sendStatus(200);
    });
});

import { User } from "./shared/user.js";
new User(123456789, "First Name", "Second Name").encode();

