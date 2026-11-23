import express from "express";
import { PORT } from "./config/serverConfig.js";
import { connectDB } from "./config/dbConfig.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleEditorSocketEvents } from "./socketHandlers/editorEventHandler.js";
import { handleContainerCreate } from "./Containers/handleContainerCreate.js";
import { WebSocketServer } from "ws";
import { handleTerminalCreation } from "./Containers/handleTerminalCreation.js";
import { registerConnection, unregisterConnection, startReaperJob } from "./Containers/containerReaper.js";

// Connect to MongoDB
connectDB();

const app = express();
startReaperJob();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/api", apiRouter);

const editorNamespace = io.of("/editor");

editorNamespace.on("connection", (socket) => {
  console.log("a user connected");
  let projectId = socket.handshake.query.projectId;
  registerConnection(projectId);

  handleEditorSocketEvents(socket, editorNamespace);

  socket.on("disconnect", async () => {
    //await watcher.close();
    console.log("editor disconnected");
    unregisterConnection(projectId);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const webSocketForTerminal = new WebSocketServer({
  noServer: true,
});

server.on("upgrade", async (req, tcpSocket, head) => {
  // req : incoming http request
  //socket : TCP connection
  // head : first packet of the upgraded stream
  const isTerminal = req.url.includes("/terminal");
  if (isTerminal) {
    const projectId = req.url.split("=")[1]; 
    await handleContainerCreate(projectId, webSocketForTerminal, req, tcpSocket, head);
  }
});

webSocketForTerminal.on("connection", (ws, req, container) => {
  console.log("Terminal connected");
  const projectId = req.url.split("=")[1];
  registerConnection(projectId);

  handleTerminalCreation(ws, container);

  //emit ws event that terminal is ready
  // ws.emit("terminalReady");


  ws.on("close", () => {
    console.log("Terminal disconnected");
    unregisterConnection(projectId);
  });
});

export { app, server };

