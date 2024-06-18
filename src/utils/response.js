// ApiResponse
class ApiResponse {
  // success response
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
 // failed response
  static error(res, message = 'Error', statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export default ApiResponse;

