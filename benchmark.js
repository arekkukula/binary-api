import { User } from "./shared/user.js";

function getUser() {
    let user = new User();
    let randomStrLen = () => Math.floor(Math.random() * 32); 
    user.id = Math.random() * 1_000_000_000 >> 0;
    user.firstName = Math.floor(Math.random() * Math.pow(10, 10)).toString();
    user.secondName = Math.floor(Math.random() * Math.pow(10, 10)).toString();

    return user;
}

async function benchmark(async_fn, msg) {
    console.log(`\n\n${msg}\n\n`);
    let dataTransfered = 0;
    for (let retries = 0; retries < 20; retries++) {
        let now = performance.now();
        let iters = Math.pow(10, retries / 4 >> 0);

        for (let i = 0; i < iters; i++) {
            dataTransfered += await (await async_fn()).json();
        }

        let jsonRuntime = Math.round((performance.now() - now) * 100) / 100;
        console.log(`${retries.toString().padEnd(4)};${iters.toString().padEnd(6)};${jsonRuntime}`);
    }

    console.log(`\n\n${msg} -- Data Transfered: ${dataTransfered}\n\n`);
}

await benchmark(async () => {
    let user = getUser();
    return await fetch("http://localhost:3000/api/json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    });
}, "JSON roundtrip");

await benchmark(async () => {
    let user = getUser();
    return await fetch("http://localhost:3000/api/buf", {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
        },
        body: user.toBuffer(),
    });
}, "Buf roundtrip");
