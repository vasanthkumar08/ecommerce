const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const csrfProtection = (req, res, next) => {
  if (!unsafeMethods.has(req.method)) {
    next();
    return;
  }

  const usesBearerToken = req.headers.authorization?.startsWith("Bearer ");
  const usesCookieAuth = Boolean(req.cookies?.accessToken);

  if (!usesCookieAuth || usesBearerToken) {
    next();
    return;
  }

  const csrfCookie = req.cookies?.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
};

export default csrfProtection;
