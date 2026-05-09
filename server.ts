import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;
  const isProd = process.env.NODE_ENV === "production";
  const root = process.cwd();

  // Real-time tracking
  let onlinePlayers = 0;

  io.on("connection", (socket) => {
    onlinePlayers++;
    io.emit("players_count", onlinePlayers);

    socket.on("disconnect", () => {
      onlinePlayers = Math.max(0, onlinePlayers - 1);
      io.emit("players_count", onlinePlayers);
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", players: onlinePlayers });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(root, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
