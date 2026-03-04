import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';

/**
 * STUN servers act as a discovery mechanism to allow peers to find their
 * public IP addresses and bypass NATs.
 */
const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class WebrtcService {

    constructor(private socketService: SocketService) { }

    /**
     * Request media stream from user hardware
     */
    public async getLocalStream(): Promise<MediaStream | null> {
        try {
            return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err) {
            console.warn('Failed to get both video and audio. Trying audio only...', err);
            try {
                return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            } catch (audioErr) {
                console.warn('Failed to get audio. Trying video only...', audioErr);
                try {
                    return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                } catch (videoErr) {
                    console.error('No media devices could be accessed.', videoErr);
                    return null;
                }
            }
        }
    }

    /**
     * Initialize a new RTCPeerConnection with STUN config and register ICE/Track handlers
     */
    public createPeerConnection(
        remoteUserId: string,
        localStream: MediaStream | null,
        onTrack: (stream: MediaStream) => void
    ): RTCPeerConnection {
        const pc = new RTCPeerConnection(RTC_CONFIG);

        // 1. Add local tracks to the connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        // 2. Handle remote tracks
        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                onTrack(event.streams[0]);
            }
        };

        // 3. Handle outgoing ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.socketService.sendIceCandidate(remoteUserId, event.candidate);
            }
        };

        return pc;
    }

    /**
     * Create an Offer, set as local description, and send to remote peer
     */
    public async createAndSendOffer(pc: RTCPeerConnection, remoteUserId: string, userName: string): Promise<void> {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.socketService.sendOffer(remoteUserId, offer, userName);
    }

    /**
     * Set remote Offer, create Answer, set local description, and send back to remote peer
     */
    public async handleOfferAndSendAnswer(
        pc: RTCPeerConnection,
        remoteUserId: string,
        offer: RTCSessionDescriptionInit
    ): Promise<void> {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socketService.sendAnswer(remoteUserId, answer);
    }

    /**
     * Set remote Answer to local connection
     */
    public async handleAnswer(pc: RTCPeerConnection, answer: RTCSessionDescriptionInit): Promise<void> {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    /**
     * Add incoming ICE candidate
     */
    public async handleCandy(pc: RTCPeerConnection, candidate: RTCIceCandidate): Promise<void> {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
}
