const helpers = require("../helpers");

const userController = {};

const isValidString = function (string) {
  return typeof string === "string" && string.trim().length > 0 ? true : false;
};

const isValidEmail = function (email) {
  const emailRegex =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  if (!isValidString(email)) {
    return false;
  }
  if (!emailRegex.test(email)) {
    return false;
  }
  if (email.length > 254) {
    return false;
  }
  return true;
};

userController.register = async function (payload) {
  const displayName = isValidString(payload.displayName)
    ? payload.displayName.trim()
    : false;
  const password = isValidString(payload.password)
    ? payload.password.trim()
    : false;
  const email = isValidEmail(payload.email) ? payload.email.trim() : false;

  if (!displayName || !password || !email) {
    return 400, { Error: "Bad input" };
  }
  let isErr = false;
  isErr = helpers.read("users", email, (err) => {
    if (err) {
      return err;
    }
  });
  if (isErr) {
    return 400, { Error: err };
  }
  const hashedPassword = helpers.hash(password);
  if (!hashedPassword) {
    return 500, { Error: "Could not hash the password" };
  }

  const userObj = {
    displayName: displayName,
    hashedPassword: hashedPassword,
    email: email,
  };

  isErr = await helpers.create("users", email, userObj, (err) => {
    if (err) {
      return err;
    }
  });
  if (isErr) {
    return 400, { Error: isErr };
  }
  return 200;
};

module.exports = userController;
