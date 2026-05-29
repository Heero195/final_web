/**
 * Middleware to require user session login.
 * Returns 401 Unauthorized if request.session.user_id is not set.
 */
function requireLogin(request, response, next) {
  if (!request.session || !request.session.user_id) {
    return response.status(401).json({ message: "Unauthorized: Please log in." });
  }
  next();
}

module.exports = requireLogin;
