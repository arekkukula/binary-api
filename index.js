import http from "http";
import express from "express";
const app = express()

http.createServer(app).listen(3000);

app.get("/", (req, res) => {
    res.sendFile("views/index.html");
});

app.get("/api/buf", (req, res) => {
    
});

import { User } from "./shared/user.js";
new User(1, "First Name", "Second Name").encode();

