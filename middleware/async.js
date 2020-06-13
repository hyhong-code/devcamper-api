// asyncHander takes in a async function and waits for it to resolve,
// if catching any error will call next with the error
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
