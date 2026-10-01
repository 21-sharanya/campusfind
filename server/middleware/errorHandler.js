// Runs when no route matched the request. Sends a 404 in JSON instead of HTML.
export const notFound = (req, res) => {
  // req.originalUrl is the URL the client asked for.
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` })
}

// Runs whenever a controller calls next(err). Express knows it's an error handler because it has FOUR parameters.
export const errorHandler = (err, req, res, next) => {
  // The client sent broken JSON in the request body.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' })
  }
  // Mongoose rejected the data (a missing field, a wrong enum value, too long, etc).
  if (err.name === 'ValidationError') {
    // Join all the field errors into one readable message.
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
    return res.status(400).json({ message })
  }
  // A value had the wrong type, for example a bad id format.
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}` })
  }
  // Anything else is unexpected, so log the full error for us in the terminal...
  console.error(err)
  // ...and send a generic message, so we never leak internal details to users.
  res.status(500).json({ message: 'Something went wrong on the server' })
}