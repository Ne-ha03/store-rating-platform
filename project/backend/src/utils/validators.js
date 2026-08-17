// Plain, hand-rolled validation helpers. Nothing fancy - just the rules
// the spec asks for, kept in one place so controllers stay readable.

function isValidName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 20 && trimmed.length <= 60;
}

function isValidAddress(address) {
  if (typeof address !== 'string') return false;
  return address.trim().length > 0 && address.trim().length <= 400;
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // good enough for standard email formats without pulling in a library
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
}

function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 16) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\];'`~/\\]/.test(password);
  return hasUppercase && hasSpecialChar;
}

function isValidRating(rating) {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
}

// Runs all the signup/registration checks at once and returns a list of
// human-readable problems (empty array means everything looks fine).
function validateUserInput({ name, email, address, password }) {
  const errors = [];
  if (!isValidName(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }
  if (!isValidEmail(email)) {
    errors.push('Please enter a valid email address.');
  }
  if (!isValidAddress(address)) {
    errors.push('Address is required and cannot exceed 400 characters.');
  }
  if (!isValidPassword(password)) {
    errors.push('Password must be 8-16 characters and include at least one uppercase letter and one special character.');
  }
  return errors;
}

module.exports = {
  isValidName,
  isValidAddress,
  isValidEmail,
  isValidPassword,
  isValidRating,
  validateUserInput,
};
