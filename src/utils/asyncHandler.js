/**
 * Wraps async route handlers to automatically forward errors to next()
 * @param {Function} fn - async express route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export { asyncHandler };
