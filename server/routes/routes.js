const userController = require("../controllers/user.controller");

const router = {};

router.userRouter = {};

router.userRouter.register = {
  method: "post",
  path: "/register",
  controller: userController.register,
};
router.userRouter.login = {
  method: "post",
  path: "/login",
  controller: userController.login,
};
router.userRouter.edit = {
  method: "put",
  path: "/edit",
  controller: userController.edit,
};
router.userRouter.delete = {
  method: "delete",
  path: "/delete",
  controller: userController.delete,
};

module.exports = router;
