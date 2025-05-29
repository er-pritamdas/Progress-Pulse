import logger from "./Logging.js"
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;

        logger.info(`## API Response ##`)
        logger.info(`Status Code ${statusCode} - ${message}`)
        logger.info(`Data : ${JSON.stringify(data)}`)
    }
}

export { ApiResponse }