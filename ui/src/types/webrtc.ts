export interface WebRTCMessage {
  type: 'join' | 'offer' | 'answer' | 'candidate';
  message?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidate;
}

export interface WebRTCState {
  localStream: MediaStream | null; // 本地流
  remoteStream: MediaStream | null; // 远程流
  peerConnection: RTCPeerConnection | null; // 连接
  socket: WebSocket | null; // 套接字
  makingOffer: boolean; // 是否正在创建 offer
  polite: boolean; // 是否礼貌
} 