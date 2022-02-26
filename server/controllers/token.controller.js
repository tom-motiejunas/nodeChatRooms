"use strict";

const helpers = require("../helpers");
const crypto = require("crypto");

const tokenController = {};

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

tokenController.create = function (payload, callback) {
  const password = isValidString(payload.password)
    ? payload.password.trim()
    : false;
  const email = isValidEmail(payload.email) ? payload.email.trim() : false;

  if (!password || !email) {
    callback(400, { Error: "Bad input" });
    return;
  }

  helpers.read("users", email, (err, userData) => {
    if (err) {
      callback(400, { Error: "Specified user does not exist" });
      return;
    }
    if (!userData) callback(400, { Error: "User does not exist" });
    if (helpers.hash(password) !== userData.hashedPassword) {
      callback(400, { Error: "Incorrect password" });
      return;
    }
    const tokenId = crypto.randomBytes(10).toString("hex");
    const expires = Date.now() + 1000 * 60 * 60;
    const tokenObject = {
      email: email,
      id: tokenId,
      expires: expires,
    };
    helpers.create("tokens", tokenId, tokenObject, (err) => {
      if (err) {
        callback(500, { Error: "Failed to create token" });
      }
    });
    callback(200, tokenObject);
  });
};
tokenController.get = function (queryStringObject, callback) {
  const id = isValidString(queryStringObject.id)
    ? queryStringObject.id.trim()
    : false;
  if (!id) callback(400, { Error: "Missing required field" });

  helpers.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      callback(200, tokenData);
    } else {
      callback(404);
    }
  });
};
tokenController.put = function (payload, callback) {
  const id = isValidString(payload.id) ? payload.id.trim() : false;
  const extend =
    typeof payload?.extend === "boolean" && payload.extend === true
      ? true
      : false;
  if (!id || !extend) {
    callback(400, { Error: "Missing required field" });
    return;
  }

  helpers.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.expires < Date.now()) {
        callback(400, { Error: "Token has expired" });
        return;
      }
      tokenData.expires = Date.now() + 1000 * 60 * 60;
      helpers.update("tokens", id, tokenData, (err) => {
        if (err) {
          callback(500, { Error: "Could not update the token" });
        } else {
          callback(200);
        }
      });
    } else {
      callback(404);
    }
  });
};
module.exports = tokenController;
