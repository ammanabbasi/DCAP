import { io, Socket } from 'socket.io-client';
import { store } from '@/store/store';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = store.getState().auth.token;
    
    if (!token) {
      console.warn('No auth token available for socket connection');
      return;
    }

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Message events
  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendMessage(conversationId: string, message: string) {
    this.socket?.emit('send_message', {
      conversationId,
      message,
    });
  }

  onMessageReceived(callback: (data: any) => void) {
    this.socket?.on('message_received', callback);
  }

  onMessageSent(callback: (data: any) => void) {
    this.socket?.on('message_sent', callback);
  }

  // Notification events
  onNotification(callback: (data: any) => void) {
    this.socket?.on('notification', callback);
  }

  // Real-time updates
  onLeadUpdated(callback: (data: any) => void) {
    this.socket?.on('lead_updated', callback);
  }

  onVehicleUpdated(callback: (data: any) => void) {
    this.socket?.on('vehicle_updated', callback);
  }

  // Clean up listeners
  off(event: string, callback?: Function) {
    this.socket?.off(event, callback as any);
  }
}

export const socketService = new SocketService();
export default socketService;