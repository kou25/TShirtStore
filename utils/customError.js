const CustomError = (message, code, res) => {
  res.status(code).json({
    success: false,
    Message: message
  });
};
export default CustomError;
