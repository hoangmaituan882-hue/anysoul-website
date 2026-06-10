import type express from "express";
import { addClient, removeClient } from "../store/content-events.js";

export function registerRealtimeRoute(app: express.Application) {
  app.get("/api/realtime/content", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);

    addClient(res);
    req.on("close", () => {
      removeClient(res);
    });
  });
}
