
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
export const errorHandler = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error!";
   
    err.statusCode = err.statusCode || 500;
    if (err.code === 11000) {
        const statusCode = 400;
        const message = `Duplicata Field Value Entered!`;
        err = new ErrorHandler(message, statusCode);
    }
    if (err === "JsonWebTokenError") {
        const statusCode = 400;
        const message = `Json Web Token is Invalid. Try again!`;
        err = new ErrorHandler(message, statusCode);
    }
    if (err === "TokenExpiredError") {
        const statusCode = 400;
        const message = `Json Web Token is Expired. Try again!`;
        err = new ErrorHandler(message, statusCode);
    }
    if (err === "CastError") {
        const statusCode = 400;
        const message = `Resource Not Found. Invalid:${err.path}!`;
        err = new ErrorHandler(message, statusCode);
    }
    const errorMessage = err.errors ? Object.values(err.errors).map((error) => error.message).join(" ")
        : err.message;

    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
}

export default ErrorHandler;


// const errorHandler = (err, req, res, next) => {
//   const statusCode = err.statusCode || 500;
//   const message = err.message || 'Internal Server Error';

//   if (process.env.NODE_ENV !== 'production') {
//     console.error('Unhandled error:', err);
//   }

//   res.status(statusCode).json({
//     success: false,
//     message,
//   });
// };

// export default errorHandler;
