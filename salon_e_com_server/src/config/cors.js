export const allowedOrigins = [
    "http://localhost:5173",
    "https://www.glowbshine.com",
    "https://glowbshine.com",
    "https://salonshop-rho.vercel.app"
];

export const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    optionsSuccessStatus: 200
};
