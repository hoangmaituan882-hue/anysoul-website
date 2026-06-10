import express from "express";

const clients = new Set<express.Response>();

function addClient(client: express.Response) {
  clients.add(client);
}

function removeClient(client: express.Response) {
  clients.delete(client);
}

function broadcast(event: string, payload: unknown) {
  const data = JSON.stringify(payload);

  for (const client of clients) {
    client.write(`event: ${event}\n`);
    client.write(`data: ${data}\n\n`);
  }
}

function createRealtimeRoute(): express.RequestHandler {
  return (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ ok: true })}\n\n`);

    clients.add(res);
    req.on("close", () => {
      clients.delete(res);
    });
  };
}

export { addClient, broadcast, createRealtimeRoute, removeClient };
