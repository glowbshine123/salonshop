import { Server } from 'socket.io';
import { corsOptions } from '../../config/cors.js';

class SocketService {
    constructor() {
        this.io = null;
    }

    init(server) {
        this.io = new Server(server, {
            cors: corsOptions
        });

        this.io.on('connection', (socket) => {


            socket.on('join', (userId) => {
                if (userId) {
                    socket.join(userId.toString());

                }
            });

            socket.on('disconnect', () => {

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
