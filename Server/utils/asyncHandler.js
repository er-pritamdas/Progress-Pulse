const asynchandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((error) => {
      // // 🔥 Print error details here
      // console.error("🔴 Async Error Caught:");
      // console.error("📍 Message:", error.message);
      // console.error("📄 Stack:\n", error.stack);
      next(error); // Pass the error to the central error handler
    });
  };
};

export default asynchandler;
