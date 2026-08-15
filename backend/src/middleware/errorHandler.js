// Central error handler. Keep messages plain and actionable — no stack traces to the client.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "P2002") {
    // Prisma unique constraint violation
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "field";
    return res.status(409).json({ error: `That ${field} is already in use.` });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "That item couldn't be found." });
  }

  const status = err.status || 500;
  const message = status === 500 ? "Something went wrong on our end." : err.message;
  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: "That route doesn't exist." });
}

module.exports = { errorHandler, notFound };
