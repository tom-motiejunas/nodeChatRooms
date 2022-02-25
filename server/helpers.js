const helpers = {};

helpers.parseJsonToObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.error("Could not parse string", err);
  }
};

module.exports = helpers;
