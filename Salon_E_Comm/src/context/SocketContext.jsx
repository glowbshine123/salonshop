import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../services/socket';
import { toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useAuth } from './AuthContext';
import { orderAPI } from '../services/apiService';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadOrderCount, setUnreadOrderCount] = useState(0);

    useEffect(() => {
        if (user?._id) {
            socket.connect();
            socket.emit('join', user._id);

            // If Admin, fetch unread order count
            if (user.role === 'ADMIN') {
                const fetchUnreadOrders = async () => {
                    try {
                        const res = await orderAPI.getUnreadCount();
                        setUnreadOrderCount(res.data.count);
                    } catch (err) {
                        console.error('Failed to fetch unread orders:', err);
                    }
                };
                fetchUnreadOrders();
            }

            socket.on('new-notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // If notification is about an order and user is ADMIN, increment order count
                if (notification.type === 'ORDER' && user.role === 'ADMIN') {
                    setUnreadOrderCount(prev => prev + 1);
                }

                // Show floating notification
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-[24px] pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 items-center gap-4 border border-neutral-100`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Bell className="text-primary" size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-neutral-900 uppercase tracking-tight">{notification.title}</p>
                            <p className="text-[10px] font-semibold text-neutral-500 line-clamp-2">{notification.description}</p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="text-[10px] font-black text-neutral-400 uppercase hover:text-neutral-900 px-2"
                        >
                            Close
                        </button>
                    </div>
                ), { duration: 5000 });
            });

            return () => {
                socket.off('new-notification');
                socket.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{
            socket,
            notifications,
            setNotifications,
            unreadCount,
            setUnreadCount,
            unreadOrderCount,
            setUnreadOrderCount
        }}>
            {children}
        </SocketContext.Provider>
    );
};
