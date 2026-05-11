function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      if (statusCode >= 500) {
        console.error(error);
      }

      res.status(statusCode).json({
        ok: false,
        error: error.message || "Request failed."
      });
    }
  };
}

function requireClientId(req) {
  if (!req.client || !req.client.id) {
    throw createHttpError(401, "Client session is required.");
  }

  return req.client.id;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toPositiveInteger(value, fallback = 1) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
  asyncHandler,
  createHttpError,
  requireClientId,
  toNumber,
  toPositiveInteger
};
