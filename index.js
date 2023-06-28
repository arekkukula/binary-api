import path from "path";
import http from "http";
import express from "express";
import { User } from "./shared/user.js";

const app = express()
const __dirname = path.resolve();
app.use("/shared", express.static(__dirname + "/shared"));
app.use(express.json());

http.createServer(app).listen(3000);

app.get("/", (_req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

// --- BUFFER ENDPOINT ---
let chunks = [];
let user = new User();

app.post("/api/buf", (req, res) => {
    req.setEncoding("binary");
    req.on("data", ch => {
        chunks.push(ch);
    });

    req.on("end", () => {
        user.fromBuffer(nodeBufferToArrayBuffer(chunks[0]));
        user.id = 0;
        chunks.splice(0, chunks.length);
        res.send(req.headers["content-length"]);
    });
});

// --- JSON ENDPOINT ---
app.post("/api/json", async (req, res) => {
    const json = req.body;
    const user = new User(json.id, json.firstName, json.secondName);
    user.id = 0;

    res.send(req.headers["content-length"]);
});

// --- UTILS ---

/** 
    * @param {Buffer} buf
    * @returns {ArrayBuffer}
*/
function nodeBufferToArrayBuffer(buf) {
    const ab = new ArrayBuffer(buf.byteLength);

    const abView = new Uint8Array(ab);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < buf.byteLength; i++) {
        abView[i] = bufView[i];
    }

    return ab;
}

