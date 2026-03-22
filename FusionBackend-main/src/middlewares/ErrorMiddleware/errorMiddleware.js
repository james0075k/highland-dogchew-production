
const errorMiddleware = (err, req, res, next) => {
  // Already sent a response — bail out
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ─── Mongoose: Validation Error (missing/invalid fields) ─────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fields = Object.values(err.errors).map(e => e.message);
    message = `Validation failed: ${fields.join(', ')}`;
  }

  // ─── Mongoose: Cast Error (bad ObjectId, wrong type) ─────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: "${err.value}". Please provide a valid value.`;
  }

  // ─── Mongoose: Duplicate Key (unique constraint) ─────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field] || '';
    message = `A record with this ${field} ("${value}") already exists.`;
  }

  // ─── Multer: File upload errors ──────────────────────────────────
  if (err.name === 'MulterError') {
    statusCode = 400;
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File is too large. Maximum size is 10 MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 20 files per upload.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = `Unexpected file field: "${err.field}". Check the upload form.`;
        break;
      default:
        message = `Upload error: ${err.message}`;
    }
  }

  // ─── Multer: File type rejected ──────────────────────────────────
  if (err.message && err.message.includes('Only image files')) {
    statusCode = 400;
    message = 'Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed.';
  }

  // ─── JWT: Token errors ───────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // ─── Stripe errors ──────────────────────────────────────────────
  if (err.type && err.type.startsWith('Stripe')) {
    statusCode = err.statusCode || 402;
    message = err.message || 'Payment processing error. Please try again.';
  }

  // ─── ENOENT: File/directory not found ────────────────────────────
  if (err.code === 'ENOENT') {
    statusCode = 500;
    message = 'A required file or directory was not found on the server. Please contact support.';
  }

  // ─── Syntax Error (malformed JSON body) ──────────────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body. Please check your data format.';
  }

  // ─── Network / timeout errors ────────────────────────────────────
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    statusCode = 503;
    message = 'Unable to connect to an external service. Please try again later.';
  }

  // Log server errors for debugging (not client errors)
  if (statusCode >= 500) {
    console.error(`[ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    }
    // Don't expose internal details in production
    if (process.env.NODE_ENV === 'production' && !err.statusCode) {
      message = 'Something went wrong on our end. Please try again or contact support.';
    }
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

export default errorMiddleware;
