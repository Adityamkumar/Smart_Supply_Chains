import rateLimit from 'express-rate-limit';

export const helpRequestLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        success: false,
        message: "Excessive coordination requests detected. Please wait 5 minutes before submitting another report."
    }
});


export const authLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, 
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        success: false,
        message: "Multiple authentication attempts detected. Access blocked for 2 minutes to ensure account security."
    }
});
