const jwt = require('jsonwebtoken');
const redisClient = require('../utils/redis');  // Assuming you have a Redis client

function Jwt(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            message: 'No Authorization Header'
        });
    }

    try {
        const token = authorization.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Invalid Token Format'
            });
        }

        // Check if the token is present in Redis
        redisClient.getAuthToken(token, (err, userId) => {
            if (err || !userId) {
                // Token not found or error during retrieval
                return res.status(401).json({
                    message: 'Invalid Token'
                });
            }

            // If the token is found in Redis, set the decoded user information in the request
            req.user = {
                userId: userId,
            };

            next();
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server Error',
            error: error.message,
        });
    }
}

module.exports = Jwt;
