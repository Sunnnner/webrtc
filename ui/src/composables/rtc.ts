import { ref, reactive } from 'vue'
import type { WebRTCState, WebRTCMessage } from '../types/webrtc'

export function useWebRTC() {
  const state = reactive<WebRTCState>({
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    socket: null,
    makingOffer: false,
    polite: false
  })

  const turnServer = import.meta.env.VITE_TURN_SERVER
  const turnUsername = import.meta.env.VITE_TURN_USERNAME
  const turnPassword = import.meta.env.VITE_TURN_PASSWORD
  const stunServer = import.meta.env.VITE_STUN_SERVER

  // 配置文件
  const config: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          stunServer,
          turnServer
        ],
        username: turnUsername,
        credential: turnPassword
      },
    ],
  };

  // 创建流
  const createStreams = async () => {
    // 接口表示本地端和远程对等端之间的 WebRTC 连接。它提供了创建远程对等端连接、维护和监视连接，以及在连接不再需要时关闭连接的方法。
    // 会话控制，网络和媒体信息收发，作用类似 http 对象
    state.peerConnection = new RTCPeerConnection(config)
    // 流媒体对象, 一个流包含几个轨道，比如视频和音频轨道。
    state.remoteStream = new MediaStream()

    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => {
        state.peerConnection?.addTrack(track, state.localStream!)
      })
    }

    state.peerConnection.ontrack = (event) => {
      console.log("adding track")
      event.streams[0].getTracks().forEach((track) => {
        // 发送数据
        state.remoteStream?.addTrack(track)
      })
    }

    state.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        state.socket?.send(
          JSON.stringify({ 
            type: "candidate", 
            candidate: event.candidate 
          })
        )
      }
    }

    state.peerConnection.onnegotiationneeded = async () => {
      try {
        state.makingOffer = true
        await state.peerConnection?.setLocalDescription()
        state.socket?.send(
          JSON.stringify({
            type: "offer",
            message: state.peerConnection?.localDescription
          })
        )
      } catch (err) {
        console.error(err)
      } finally {
        state.makingOffer = false
      }
    }
  }

  const handlePerfectNegotiation = async (data: WebRTCMessage) => {
    try {
      if (data.message && state.peerConnection) {
        const offerCollision =
          data.message.type === "offer" &&
          (state.makingOffer || state.peerConnection.signalingState !== "stable")

        const ignoreOffer = !state.polite && offerCollision
        if (ignoreOffer) {
          return
        }

        await state.peerConnection.setRemoteDescription(data.message)
        if (data.message.type === "offer") {
          await state.peerConnection.setLocalDescription()
          state.socket?.send(JSON.stringify({
            type: "answer",
            message: state.peerConnection.localDescription,
          }))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMessage = async (event: MessageEvent) => {
    const data = JSON.parse(event.data) as WebRTCMessage
    
    if (data.type === "join") {
      state.polite = true
      await createAndSendOffer()
    }
    if (data.type === "offer" || data.type === "answer") {
      await handlePerfectNegotiation(data)
    }
    if (data.type === "candidate" && data.candidate) {
      if (state.peerConnection?.remoteDescription) {
        await state.peerConnection.addIceCandidate(data.candidate)
      }
    }
  }

  const connect = async () => {
    const roomName = window.location.pathname.split("/")[1]
    // 从环境变量获取host
    const host = import.meta.env.VITE_RTC_HOST
    state.socket = new WebSocket(`wss://${host}/rooms/${roomName}`)
    
    state.socket.onopen = async () => {
      await createAndSendOffer()
    }

    state.socket.onmessage = handleMessage
  }

  const createAndSendOffer = async () => {
    await createStreams()
  }

  const getMediaStream = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    try {
      if (isMobile) {
        try {
          state.localStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
          });
        } catch (err) {
          console.warn('移动端屏幕共享失败,切换到摄像头模式:', err);
          state.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100
            }
          });
        }
      } else {
        state.localStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "monitor"
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`获取媒体流失败: ${err.message}`);
      } else {
        throw new Error('获取媒体流失败: 未知错误');
      }
    }
  }

  const init = async () => {
    try {
      await getMediaStream();
      await connect();
    } catch (err) {
      console.error('Failed to initialize WebRTC:', err);
    }
  }

  return {
    state,
    init
  }
}