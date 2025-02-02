// const asyncHandler = (reqHandler) => {
//   return async (req, res, next) => {
//     try {
//       await reqHandler(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };
// };

// export { asyncHandler };

const asyncHandler = (handler) => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export { asyncHandler };