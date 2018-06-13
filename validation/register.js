const validator = require("validator");
const isEmpty = require("./isempty");

const validateRegister = data => {
  let errors = {};

  if (isEmpty(data.name)) {
    errors.name = "Name field is required";
  } else if (!validator.isLength(data.name, { min: 2, max: 20 })) {
    errors.name = "Name must be between 2 and 20 characters";
  }

  if (isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (isEmpty(data.password)) {
    errors.password = "Password is required";
  } else if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }

  if (isEmpty(data.password2) || isEmpty(data.password)) {
    errors.password2 = "Confirm password";
  } else if (!validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = validateRegister;
