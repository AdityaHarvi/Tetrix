// Import the express in typescript file
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Level } from "./src/Level";
import { Scoreboard } from "./src/Scoreboard";
import { PlayerQueue } from "./src/PlayerQueue";
import { Spectator } from "./src/Spectator";
import path from "path";

import { ServerToClientEvents, ClientToServerEvents } from "common/message";
import { ColoredScore } from "common/shared";

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}
// =================== grab from tutorial ==============

// Initialize the express engine
const app: express.Application = express();

app.use(function (_, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// host static frontend
app.use("/", express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

// Take a port 3000 for running server.
const port = process.env.PORT || 80;

// Server setup
server.listen(port);

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(server, {
    cors: {
        origin: "*",
    },
});

console.log(`Server started at port ${port}`);
let playerCounter: 0 | 1 | 2 | 3 = 0; // FIXME: Remove this on final version.
const scoreboard = new Scoreboard();
const level = new Level();
const queue = new PlayerQueue();
const spectator = new Spectator();

// =========== Emit to all sockets ================
export function broadcastUpdateScoreboard(msg: Array<ColoredScore>) {
    io.sockets.emit("updateScoreboard", msg);
}

export function broadcastToSceneWaitingRoom() {
    queue.resetQueue();
    io.sockets.emit("toSceneWaitingRoom");
}

export function broadcastToSceneGameArena() {
    io.sockets.emit("toSceneGameArena");
}

export function broadcastToSceneGameOver(msg: Array<ColoredScore>) {
    io.sockets.emit("toSceneGameOver", msg);
}

export function broadcastShowVotingSequence(votingSequence: string) {
    io.sockets.emit("showVotingSequence", votingSequence);
}

export function broadcastHideVotingSequence() {
    io.sockets.emit("hideVotingSequence");
}

export function broadcastRemainingPlayers(playersNeeded: number) {
    io.sockets.emit("updateRemainingPlayers", playersNeeded);
}
// ==============================================

// Uncomment to view the game end sequence:
// setTimeout(() => {
//   console.log("Sending clients to Game Over Screen!")
//   scoreboard.displaySceneGameOver();
// }, 30000);

io.on("connection", (socket) => {
    if (process.env.VITE_DISABLE_WAITING_ROOM) {
        socket.emit("initPlayer", playerCounter);
        playerCounter += 1;
        playerCounter %= 4;
    }

    socket.on("playerMove", (...args) => {
        socket.broadcast.emit("playerMove", ...args);
    });
  socket.on("playerTrade", (...args) => {
    socket.broadcast.emit("playerTrade", ...args);
    })
    scoreboard.initSocketListeners(socket, level);
    spectator.initSocketListeners(socket);
    queue.initSocketListeners(socket);
    // FIXME need a state machine to tell which scene the game is at, conditionally tackle disconnections?
});
