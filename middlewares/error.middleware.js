const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;

    console.error(err);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Server Error",
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
