const userController = require("../controllers/user.controller");
const tokenController = require("../controllers/token.controller");

const router = {};

router.userRouter = {};
router.tokenRouter = {};

router.useRouter = (data, callback) => {
  if (data.path.match("user")) {
    return router.userRouter(data, callback);
  } else if (data.path.match("token")) {
    return router.tokenRouter(data, callback);
  } else {
    return callback(405);
  }
};

router.userRouter = (data, callback) => {
  const acceptableMethods = ["post", "put", "delete"];
  console.log(data, callback);
  if (acceptableMethods.indexOf(data.method) !== -1) {
    return router.userRouter[data.method](data, data.path, callback);
  } else {
    return callback(405);
  }
};

router.userRouter.post = (data, path, callback) => {
  if (path === "user/register") {
    return userController.register(data.payload, callback);
  } else if (path === "user/login") {
    return userController.login(data.payload, callback);
  } else {
    callback(405, { Error: "Unknown path" });
  }
};
router.userRouter.put = (data, path, callback) => {
  if (path === "user/edit") {
    return userController.edit(data, callback);
  } else {
    callback(405, { Error: "Unknown path" });
  }
};
router.userRouter.delete = (data, path, callback) => {
  if (path === "user/delete") {
    return userController.delete(data, callback);
  } else {
    callback(405, { Error: "Unknown path" });
  }
};

router.tokenRouter = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) !== -1) {
    return router.tokenRouter[data.method](data, data.path, callback);
  } else {
    return callback(405);
  }
};

router.tokenRouter.post = (data, path, callback) => {
  if (path === "token/create") {
    return tokenController.create(data.payload, callback);
  } else {
    callback(405, { Error: "Unknown path" });
  }
};
router.tokenRouter.get = (data, path, callback) => {
  if (path === "token/get") {
    return tokenController.get(data.queryStringObject, callback);
  } else {
    callback(405, { Error: "Unknown path" });
  }
};
router.tokenRouter.put = (data, path, callback) => {
  if (path === "token/put") {
    return tokenController.put(data.payload, callback);
  } else {
    callback(405, { Error: "Unknown path" });
  }
};
router.tokenRouter.delete = (data, path, callback) => {
  if (path === "token/delete") {
    return tokenController.delete(data.queryStringObject, callback);
  } else {
    callback(405, { Error: "Unknown path" });
  }
};
//router.socket.connection = () => {};
//router.socket.message = () => {};

module.exports = router;
