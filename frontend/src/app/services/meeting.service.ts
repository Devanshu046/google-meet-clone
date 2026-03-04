import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Participant } from '../models/participant.model';
import { SocketService } from './socket.service';
import { WebrtcService } from './webrtc.service';
import { Router } from '@angular/router';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
    providedIn: 'root'
})
export class MeetingService {

    private participantsSubject = new BehaviorSubject<Participant[]>([]);
    public participants$ = this.participantsSubject.asObservable();

    private chatMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    public chatMessages$ = this.chatMessagesSubject.asObservable();

    public localStream: MediaStream | null = null;
    public localUserName: string = '';
    public currentRoomId: string = '';

    constructor(
        private socketService: SocketService,
        private webrtcService: WebrtcService,
        private router: Router
    ) { }

    /**
     * Initializes meeting logic.
     * Gets local stream, connects socket, registers WebRTC handlers, and joins room.
     */
    public async initializeMeeting(roomId: string, userName: string): Promise<void> {
        this.localUserName = userName;
        this.currentRoomId = roomId;

        try {
            this.localStream = await this.webrtcService.getLocalStream();
            if (!this.localStream) {
                alert('Could not access any camera or microphone. You are joining without media.');
            }
        } catch (err) {
            console.error('Failed to get local stream.', err);
            this.localStream = null;
        }

        // Connect to signaling server
        this.socketService.connect();

        // Setup local participant
        const localParticipant: Participant = {
            id: this.socketService.getSocketId() || 'local',
            stream: this.localStream,
            userName: this.localUserName,
            isLocal: true
        };
        this.participantsSubject.next([localParticipant]);

        this.registerSocketEvents();
        this.socketService.joinRoom(roomId, userName);
    }

    /**
     * Listens to signaling events and coordinates WebRTC connection flows.
     */
    private registerSocketEvents(): void {

        // When a NEW user joins, CREATE an offer and send to them
        this.socketService.onUserJoined().subscribe(async ({ userId, userName }) => {
            const pc = this.createParticipantConnection(userId, userName);
            await this.webrtcService.createAndSendOffer(pc, userId, this.localUserName);
        });

        // When an offer is received, HANDLE it and SEND an answer
        this.socketService.onOffer().subscribe(async ({ offer, userId, userName }) => {
            const pc = this.createParticipantConnection(userId, userName);
            await this.webrtcService.handleOfferAndSendAnswer(pc, userId, offer);
        });

        // When an answer is received, SET it on local connection
        this.socketService.onAnswer().subscribe(async ({ answer, userId }) => {
            const participant = this.getParticipant(userId);
            if (participant && participant.peerConnection) {
                await this.webrtcService.handleAnswer(participant.peerConnection, answer);
            }
        });

        // When an ICE candidate is received, ADD it to the connection
        this.socketService.onIceCandidate().subscribe(async ({ candidate, userId }) => {
            const participant = this.getParticipant(userId);
            if (participant && participant.peerConnection) {
                await this.webrtcService.handleCandy(participant.peerConnection, candidate);
            }
        });

        // Clean up when user leaves
        this.socketService.onUserDisconnected().subscribe(userId => {
            this.removeParticipant(userId);
        });

        // Listen for incoming chat messages
        this.socketService.onChatMessage().subscribe((chatMessage: ChatMessage) => {
            this.addIncomingChatMessage(chatMessage);
        });
    }

    /**
     * Creates a Peer Connection, sets up tracks, and manages state
     */
    private createParticipantConnection(userId: string, userName: string): RTCPeerConnection {

        const pc = this.webrtcService.createPeerConnection(userId, this.localStream, (remoteStream) => {
            // Setup stream exactly when it's received
            this.updateParticipantStream(userId, remoteStream);
        });

        this.addParticipant({
            id: userId,
            stream: null, // Will be populated when onTrack fires
            userName,
            isLocal: false,
            peerConnection: pc
        });

        return pc;
    }

    // --- State management helpers ---

    private getParticipant(userId: string): Participant | undefined {
        return this.participantsSubject.value.find(p => p.id === userId);
    }

    private addParticipant(p: Participant): void {
        const current = this.participantsSubject.value.filter(existing => existing.id !== p.id);
        this.participantsSubject.next([...current, p]);
    }

    private updateParticipantStream(userId: string, stream: MediaStream): void {
        const list = this.participantsSubject.value.map(p => {
            if (p.id === userId) {
                return { ...p, stream };
            }
            return p;
        });
        this.participantsSubject.next(list);
    }

    private removeParticipant(userId: string): void {
        const p = this.getParticipant(userId);
        if (p && p.peerConnection) {
            p.peerConnection.close();
        }
        const filtered = this.participantsSubject.value.filter(p => p.id !== userId);
        this.participantsSubject.next(filtered);
    }

    // --- Chat management ---

    public sendChatMessage(messageText: string): void {
        // Send to remote peers
        this.socketService.sendChatMessage(messageText, this.localUserName);

        // Add to local state
        const localMsg: ChatMessage = {
            senderId: this.socketService.getSocketId() || 'local',
            senderName: this.localUserName,
            message: messageText,
            timestamp: new Date(),
            isLocal: true
        };
        this.chatMessagesSubject.next([...this.chatMessagesSubject.value, localMsg]);
    }

    private addIncomingChatMessage(msg: ChatMessage): void {
        this.chatMessagesSubject.next([...this.chatMessagesSubject.value, msg]);
    }

    // --- End Meeting ---

    public leaveMeeting(): void {
        // 1. Send leave event
        this.socketService.leaveRoom();

        // 2. Stop all local tracks (camera/mic off)
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        // 3. Close all peer connections
        this.participantsSubject.value.forEach(p => {
            if (p.peerConnection) {
                p.peerConnection.close();
            }
        });

        // 4. Reset state
        this.participantsSubject.next([]);
        this.chatMessagesSubject.next([]);
        this.localStream = null;
        this.localUserName = '';
        this.currentRoomId = '';

        // 5. Navigate to Home
        this.router.navigate(['/']);
    }
}
