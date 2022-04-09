//try catch and async-await || use promise

export const BigPromise = (func) => (req, res, next) =>
  Promise.resolve(func(req, res, next)).catch(next);
