/**
 * ApiResponse
 * Standardized success response structure for all API endpoints.
 */

export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (2xx)
   * @param {*}      data       - Response payload
   * @param {string} message    - Human-readable success message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

/**
 * Send a structured success response.
 * @param {Response} res
 * @param {*}        data
 * @param {string}   message
 * @param {number}   statusCode
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

/**
 * Send a paginated list response.
 * @param {Response} res
 * @param {Array}    data
 * @param {number}   total
 * @param {number}   page
 * @param {number}   limit
 * @param {string}   message
 */
export const sendPaginated = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
};
