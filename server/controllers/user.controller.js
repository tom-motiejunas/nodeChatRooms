"use strict";

const helpers = require("../helpers");
const { verifyToken } = require("./token.controller");

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

userController.register = async function (payload, callback) {
  const displayName = isValidString(payload.displayName)
    ? payload.displayName.trim()
    : false;
  const password = isValidString(payload.password)
    ? payload.password.trim()
    : false;
  const email = isValidEmail(payload.email) ? payload.email.trim() : false;

  if (!displayName || !password || !email) {
    callback(400, { Error: "Bad input" });
    return;
  }
  helpers.read("users", email, (err) => {
    if (!err) {
      callback(400, "User already exists with that email");
      return;
    } else {
      const hashedPassword = helpers.hash(password);
      if (!hashedPassword) {
        callback(500, { Error: "Could not hash the password" });
        return;
      }

      const userObj = {
        displayName: displayName,
        hashedPassword: hashedPassword,
        email: email,
      };

      helpers.create("users", email, userObj, (err) => {
        if (err) {
          callback(err);
          return;
        }
      });
      callback(200);
    }
  });
};

userController.login = function (payload, callback) {
  const password = isValidString(payload.password)
    ? payload.password.trim()
    : false;
  const email = isValidEmail(payload.email) ? payload.email.trim() : false;
  if (!password || !email) {
    callback(400, { Error: "Bad input" });
    return;
  }
  helpers.read("users", email, (err, data) => {
    if (err) {
      callback(400, { Error: "Email address not found" });
      return;
    }
    const hashedPassword = helpers.hash(password);
    if (!hashedPassword) {
      callback(500, { Error: "Could not hash the password" });
      return;
    }
    if (hashedPassword === data.hashedPassword) {
      callback(200);
      return;
    } else {
      callback(400, { Error: "Incorrect Password" });
      return;
    }
  });
};

userController.edit = function (data, callback) {
  const password = isValidString(data.payload.password)
    ? data.payload.password.trim()
    : false;
  const email = isValidEmail(data.payload.email)
    ? data.payload.email.trim()
    : false;
  const displayName = isValidString(data.payload.displayName)
    ? data.payload.displayName.trim()
    : false;
  const token = isValidString(data.headers.token)
    ? data.headers.token.trim()
    : false;
  if (!email) {
    callback(400, { Error: "Missing required fields" });
    return;
  }
  if (!password && !displayName) {
    callback(400, { Error: "Missing fields to update" });
    return;
  }
  verifyToken(token, email, (isValidToken) => {
    if (!isValidToken) {
      callback(403, {
        Error: "Missing required token in header, or token is invalid",
      });
      return false;
    }
    helpers.read("users", email, (err, userData) => {
      if (err) {
        callback(400, { Error: "Email address not found" });
        return;
      }
      if (password) {
        userData.password = helpers.hash(password);
      }
      if (displayName) {
        userData.displayName = displayName;
      }
      helpers.update("users", email, userData, (err) => {
        if (!err) {
          callback(200);
        } else {
          console.error(err);
          callback(500, {});
        }
      });
    });
  });
};

userController.delete = function (data, callback) {
  const email = isValidEmail(data.payload.email)
    ? data.payload.email.trim()
    : false;
  const token = isValidString(data.headers.token)
    ? data.headers.token.trim()
    : false;
  if (!email) {
    callback(400, { Error: "Missing required fields" });
    return;
  }
  verifyToken(token, email, (isValidToken) => {
    if (!isValidToken) {
      callback(403, {
        Error: "Missing required token in header, or token is invalid",
      });
      return;
    }
    helpers.read("users", email, (err) => {
      if (err) {
        callback(400, { Error: "Email address not found" });
        return;
      }
      helpers.delete("users", email, (err) => {
        if (!err) {
          callback(200);
        } else {
          console.error(err);
          callback(500, {});
        }
      });
    });
  });
};

module.exports = userController;
