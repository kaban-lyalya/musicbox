const isEmpty = require("./isempty");

const validateLogin = data => {
  let errors = {};

  if (isEmpty(data.login)) {
    errors.name = "Name or Email is required";
  }

  if (isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = validateLogin;
