import { Server } from 'socket.io';

class SocketService {
    constructor() {
        this.io = null;
    }

    init(server) {
        this.io = new Server(server, {
            cors: {
                origin: [
                    "https://projectsalonshop.vercel.app",
                    "https://salonshop-weld.vercel.app",
                    "http://localhost:5173"
                ],
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        this.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('join', (userId) => {
                if (userId) {
                    socket.join(userId.toString());
                    console.log(`User joined room: ${userId}`);
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        return this.io;
    }

    getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized');
        }
        return this.io;
    }

    emitToUser(userId, event, data) {
        if (this.io && userId) {
            this.io.to(userId.toString()).emit(event, data);
        }
    }
}

export default new SocketService();
