"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, UnauthorizedAdmin } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      console.log(authHeader);
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be logged in and be admin.
 *
 * If not, raises Unauthorized Admin.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedAdmin();
    } else {
      return next();
    }
  } catch (error) {
    next(error);
  }
}

/** Middleware to use when they must be owner or be admin.
 *
 * If not, raises Unauthorized.
 */

function ensureOwnerOrAdmin(req, res, next) {
  try {
    if (res.locals.user.isAdmin) return next();

    let qUser = req._parsedUrl.pathname.split("/")[1];
    if (!res.locals.user || res.locals.user.username !== qUser) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureOwnerOrAdmin,
};
