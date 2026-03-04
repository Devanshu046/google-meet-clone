export interface Participant {
    id: string; // Socket ID or Peer ID
    stream: MediaStream | null;
    userName: string;
    isLocal: boolean;
    peerConnection?: RTCPeerConnection;
}
