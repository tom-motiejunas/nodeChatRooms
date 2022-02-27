"use strict";

const port = 3000;
const http = require("http");
const url = require("url");
const routes = require("./routes/routes");

const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  path: "/room",
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
});

server.on("request", async (req, res) => {
  const requestData = await getRequestData(req);
  if (requestData.path === "room") {
    return;
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE",
      "Access-Control-Max-Age": 86400,
      "Access-Control-Allow-Headers": "*",
      Connection: "keep-alive",
    });
    res.end();
    return;
  }
  routes.useRouter(requestData, (statusCode, data) => {
    console.log(statusCode, data);
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE",
      "Access-Control-Max-Age": 2592000, // 30 days
    });
    if (data) {
      res.write(JSON.stringify(data));
    }
    res.end();
  });
});

io.on("connection", (socket) => {
  socket.on("joinChat", ({ displayName }) => {
    socket.emit("message", { message: `welcome ${displayName}` });
  });

  socket.on("chatMessage", ({ message, displayName }) => {
    console.log(message, displayName);
    io.emit("message", { message, displayName });
  });
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});

const getPathFromParsedUrl = function (parsedUrl) {
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  return trimmedPath;
};

const getPayloadFromRequest = async function (req) {
  const buffers = [];
  for await (const chunk of req) {
    if (typeof chunk !== "string") buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  if (!data) return;
  return JSON.parse(data);
};

const getRequestData = async function (req) {
  const parsedUrl = url.parse(req.url, true);
  const path = getPathFromParsedUrl(parsedUrl);
  const queryStringObject = parsedUrl.query;
  const method = req.method.toLowerCase();
  const headers = req.headers;
  const payload = await getPayloadFromRequest(req);

  const requestData = {
    path: path,
    queryStringObject: queryStringObject,
    method: method,
    headers: headers,
    payload: payload,
  };
  return requestData;
};
