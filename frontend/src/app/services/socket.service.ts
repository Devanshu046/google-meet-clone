import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket!: Socket;
    // TODO: change to environment variable if needed
    private readonly SERVER_URL = 'https://google-meet-clone-backend-6f5i.onrender.com/';

    constructor() { }

    public connect(): void {
        if (!this.socket) {
            this.socket = io(this.SERVER_URL);
        }
    }

    public getSocketId(): string {
        return this.socket?.id || '';
    }

    public joinRoom(roomId: string, userName: string): void {
        this.socket.emit('join-room', { roomId, userName });
    }

    public leaveRoom(): void {
        this.socket.emit('leave-room');
    }

    public sendOffer(targetUserId: string, offer: RTCSessionDescriptionInit, userName: string): void {
        this.socket.emit('offer', { targetUserId, offer, userName });
    }

    public sendAnswer(targetUserId: string, answer: RTCSessionDescriptionInit): void {
        this.socket.emit('answer', { targetUserId, answer });
    }

    public sendIceCandidate(targetUserId: string, candidate: RTCIceCandidate): void {
        this.socket.emit('ice-candidate', { targetUserId, candidate });
    }

    public sendChatMessage(message: string, userName: string): void {
        const payload = {
            senderId: this.getSocketId(),
            senderName: userName,
            message,
            timestamp: new Date()
        };
        this.socket.emit('chat-message', payload);
    }

    // --- Listeners --- 

    public onUserJoined(): Observable<{ userId: string; userName: string }> {
        return new Observable(observer => {
            this.socket.on('user-joined', (data) => observer.next(data));
        });
    }

    public onUserDisconnected(): Observable<string> {
        return new Observable(observer => {
            this.socket.on('user-disconnected', (userId) => observer.next(userId));
        });
    }

    public onOffer(): Observable<{ offer: RTCSessionDescriptionInit; userId: string; userName: string }> {
        return new Observable(observer => {
            this.socket.on('offer', (data) => observer.next(data));
        });
    }

    public onAnswer(): Observable<{ answer: RTCSessionDescriptionInit; userId: string }> {
        return new Observable(observer => {
            this.socket.on('answer', (data) => observer.next(data));
        });
    }

    public onIceCandidate(): Observable<{ candidate: RTCIceCandidate; userId: string }> {
        return new Observable(observer => {
            this.socket.on('ice-candidate', (data) => observer.next(data));
        });
    }

    public onChatMessage(): Observable<any> {
        return new Observable(observer => {
            this.socket.on('chat-message', (data) => observer.next(data));
        });
    }
}
