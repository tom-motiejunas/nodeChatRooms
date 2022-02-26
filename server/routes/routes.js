const userController = require("../controllers/user.controller");

const router = {
  method: "post",
  path: "/register",
  controller: userController.register,
};

module.exports = router;
