import { ApiError } from "../utils/ApiError.js";

/**
 * Returns a middleware that only allows users whose role is in the allowed list.
 * Must be used AFTER verifyJWT.
 *
 * Roles: DOCTOR | NURSE | ADMIN | DATA_ENGINEER
 *
 * @param  {...string} roles - Allowed roles
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Unauthorized: Please log in first"));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    `Forbidden: Role '${req.user.role}' is not allowed to access this resource`
                )
            );
        }

        next();
    };
};
