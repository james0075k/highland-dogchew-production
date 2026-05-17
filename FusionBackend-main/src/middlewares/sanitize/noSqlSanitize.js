/**
 * Defense-in-depth: strips any object key starting with "$" from req.body
 * before route handlers run. Mongo operator injection (e.g. {"$ne":null}) is
 * the most common NoSQL attack vector, and Joi already blocks it on validated
 * routes — this middleware catches anything we forgot.
 *
 * We only sanitize req.body (and not req.query / req.params) for two reasons:
 *   1. Express 5 makes req.query a read-only getter; mutating it throws.
 *   2. All authenticated/payment routes carry their payload in the body.
 *
 * Keys containing "." are also stripped — they can be used to traverse nested
 * fields in some Mongoose operations and have no legitimate use in our API.
 */
function stripOperators(value) {
  if (value === null || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    for (const item of value) stripOperators(item);
    return;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
      continue;
    }
    stripOperators(value[key]);
  }
}

export default function noSqlSanitize(req, _res, next) {
  if (req.body && typeof req.body === 'object') stripOperators(req.body);
  next();
}
