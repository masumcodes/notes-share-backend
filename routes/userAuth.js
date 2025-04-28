const jwt = require("jsonwebtoken");
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Authentication token require");
  jwt.verify(token, "NoteShare1333", (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token expired.please signIn again" });
    }
    req.user = user;
    next();
  });
};
module.exports = { authenticateToken };
