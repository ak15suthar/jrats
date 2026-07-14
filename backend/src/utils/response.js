const success = (res, data = null, statusCode = 200) => {
  const response = { success: true };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const created = (res, data = null) => success(res, data, 201);

const error = (res, message = 'Something went wrong', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, error: message });
};

const badRequest = (res, message) => error(res, message, 400);
const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401);
const forbidden = (res, message = 'Forbidden') => error(res, message, 403);
const notFound = (res, message = 'Not found') => error(res, message, 404);
const conflict = (res, message) => error(res, message, 409);
const serverError = (res, message = 'Server error') => error(res, message, 500);

module.exports = {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
};