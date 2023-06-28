/** Author: @arekkukula on GitHub.
 * See https://github.com/arekkukula/binary-api/LICENSE.md for license contents.
*/
import { User } from "./shared/user.js";

const STR_LEN = 10;
const SEQ = [1, 10, 100, 1000, 10000];
const SEQ_ITERS = 4;

function getUser() {
    let user = new User();
    user.id = Math.random() * 1_000_000_000 >> 0;
    user.firstName = Math.floor(Math.random() * Math.pow(10, STR_LEN)).toString();
    user.secondName = Math.floor(Math.random() * Math.pow(10, STR_LEN)).toString();

    return user;
}

// console.log("\n\nWarmup starts\n\n");

// for (let warmupRounds = 0; warmupRounds < 5; warmupRounds++) {
    // let warmupPromises = [];
    // for (let i = 0; i < 1000; i++) {
        // warmupPromises.push(JSONTest());
        // warmupPromises.push(BufTest());
    // }
    // await Promise.all(warmupPromises);
// }

// console.log("\n\nWarmup ended\n\n");

console.log("\nThe onslaught begins!\n");

async function benchmark(async_fn, msg) {
    console.log(`\n\n${msg}\n\n`);

    let dataTransfered = 0;

    for (let seq of SEQ) {
        for (let retries = 0; retries < SEQ_ITERS; retries++) {
            let now = performance.now();

            for (let i = 0; i < seq; i++) {
                dataTransfered += await async_fn();
            }

            let jsonRuntime = Math.round((performance.now() - now) * 100) / 100;
            console.log(`${retries.toString().padEnd(4)};${seq.toString().padEnd(6)};${jsonRuntime}`);
        }
    }

    console.log(`\n\n${msg} -- Data Transfered: ${dataTransfered}\n\n`);
}

await benchmark(JSONTest, "JSON roundtrip");
// await triggerRestart();
await benchmark(BufTest, "Buf roundtrip");

async function BufTest() {
    let user = getUser();
    return await (await fetch("http://localhost:3000/api/buf", {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
        },
        body: user.toBuffer(),
    })).json();
}

async function JSONTest() {
    let user = getUser();
    return await (await fetch("http://localhost:3000/api/json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    })).json();
}

// async function triggerRestart() {
    // try {
        // return await fetch("http://localhost:3000/restart");
    // } catch(e) {
        // await new Promise(resolve => setTimeout(resolve, 3000));
    // }
// }

