export const allowedOrigins = [
    "https://projectsalonshop.vercel.app",
    "https://salonshop-weld.vercel.app",
    "http://localhost:5173",
    /\.vercel\.app$/ // Allow any vercel.app subdomain for flexibility
];

export const corsOptions = {
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
