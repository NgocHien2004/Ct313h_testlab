const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV === "development";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  headers: true,
  handler: (req, res) => {
    return res.status(429).json({
      status: "fail",
      message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
    });
  },
});

module.exports = apiLimiter;
