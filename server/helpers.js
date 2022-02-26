const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const helpers = {};

helpers.parseJsonToObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.error("Could not parse string", err);
  }
};

helpers.baseDir = path.join(__dirname, "./.data/");

helpers.create = async function (dir, file, data, callback) {
  let fileDescriptor;
  try {
    fileDescriptor = await fs.promises.open(
      `${helpers.baseDir}${dir}/${file}.json`,
      "wx"
    );
    if (!fileDescriptor) return;
    const stringData = JSON.stringify(data);
    await fs.promises.writeFile(fileDescriptor, stringData);
    await fileDescriptor.close();
  } catch (err) {
    return callback("File already exist");
  } finally {
    if (fileDescriptor) {
      fileDescriptor.close();
    }
  }
};

helpers.read = function (dir, file, callback) {
  fs.readFile(`${helpers.baseDir}${dir}/${file}.json`, "utf-8", (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

helpers.update = async function (dir, file, data, callback) {
  let fileDescriptor;
  try {
    const fsPath = `${helpers.baseDir}${dir}/${file}.json`;
    fileDescriptor = await fs.promises.open(fsPath, "r+");
    if (!fileDescriptor) return;
    const stringData = JSON.stringify(data);
    await fs.promises.truncate(fsPath);
    await fs.promises.writeFile(fileDescriptor, stringData);
  } catch (err) {
    callback(err);
  } finally {
    fileDescriptor.close();
    callback(false);
  }
};

helpers.delete = (dir, file, callback) => {
  fs.unlink(`${helpers.baseDir}${dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting the file");
    }
  });
};

helpers.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", "hashingSecret")
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return;
  }
};

module.exports = helpers;
