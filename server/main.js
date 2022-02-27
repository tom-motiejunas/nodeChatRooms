"use strict";

const port = 3000;
const http = require("http");
const url = require("url");
const routes = require("./routes/routes");

const server = http.createServer();

server.on("request", async (req, res) => {
  const requestData = await getRequestData(req);
  routes.useRouter(requestData, (statusCode, data) => {
    console.log(statusCode, data);
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });
    if (data) {
      res.write(JSON.stringify(data));
    }
    res.end();
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
    buffers.push(chunk);
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
