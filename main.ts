import { Application, Router, Status } from "https://deno.land/x/oak/mod.ts";
import { connect } from "https://deno.land/x/redis/mod.ts";
import { getCurrentDateTimeFormatted, censorMessage } from "./util.ts";

const connectedClients = new Map();

const app = new Application();
const port = 4000;
const router = new Router();
const REDIS_IP = "workclock-redis-service";

const redis = await connect({
    hostname: REDIS_IP,
    port: 6379,
});

function broadcast(message) {
    for (const client of connectedClients.values()) {
        client.send(message);
    }
}

function broadcast_usernames() {
    const usernames = [...connectedClients.keys()];
    console.log(
        "[Workclock-socket] Sending updated username list to all clients: " +
        JSON.stringify(usernames),
    );
    broadcast(
        JSON.stringify({
            event: "update-users",
            usernames: usernames,
        }),
    );
}

router.get("/start_web_socket", async (ctx) => {
    const socket = await ctx.upgrade();
    const username = ctx.request.url.searchParams.get("username");
    if (connectedClients.has(username)) {
        socket.close(1008, `Username ${username} is already taken`);
        return;
    }

    socket.username = username;
    connectedClients.set(username, socket);
    console.log(`[Workclock-socket] New client connected: ${username}`);

    socket.onopen = () => {
        broadcast_usernames();
    };

    socket.onclose = () => {
        console.log(`[Workclock-socket] Client ${socket.username} disconnected`);
        connectedClients.delete(socket.username);
        broadcast_usernames();
    };

    socket.onmessage = async (m) => {
        const data = JSON.parse(m.data);
        switch (data.event) {
            case "send-message":
                const censoredMessage = await censorMessage(data.message);
                redis.set(socket.username, data.message);
                redis.set('lts_msg', censoredMessage);
                broadcast(
                    JSON.stringify({
                        event: "send-message",
                        username: socket.username,
                        message: censoredMessage,
                        timestamp: getCurrentDateTimeFormatted(),
                    }),
                );
                break;
        }
    };
});

router.get("/heartbeat", (ctx) => {
    ctx.response.body = "OK";
});

router.get("/heartbeat-redis", async (ctx) => {
    let isOk = false;
    try {
        const reply = await redis.sendCommand("SET", ["health", "ok"]);
        if (reply === "OK") {
            ctx.response.status = Status.OK;
            ctx.response.body = { message: "Service is accessible." };
            isOk = true;
        }
    } catch (error) {
        console.error("Redis error:", error);
    }

    if (!isOk) {
        ctx.response.status = Status.ServiceUnavailable;
        ctx.response.body = { message: "Service is not available." };      
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("[Workclock-socket] Listening at http://localhost:" + port);
await app.listen({ port });