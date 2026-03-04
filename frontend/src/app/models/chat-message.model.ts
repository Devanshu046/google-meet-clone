export interface ChatMessage {
    senderName: string;
    senderId: string;
    message: string;
    timestamp: Date;
    isLocal?: boolean;
}
