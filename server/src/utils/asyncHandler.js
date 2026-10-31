/**
 * asyncHandler
 * Wraps async route handlers to automatically catch rejected promises
 * and forward them to Express's next() error handler.
 * Eliminates the need for try/catch in every controller method.
 *
 * @param {Function} fn - Async Express route handler
 * @returns {Function}  - Wrapped handler
 */

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
