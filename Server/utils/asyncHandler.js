
const asynchandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((error) => {
      next(error); // Pass the error to the central error handler
    });
  };
};

export default asynchandler;
