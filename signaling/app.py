from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket, WebSocketDisconnect
import logging

from src.signaling import MeetingManager

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
meeting_manager = MeetingManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/rooms/{room_id}")
async def handle_websocket(websocket: WebSocket, room_id: str):
    try:
        await meeting_manager.join(room_id, websocket)
        logger.info(f"Client {room_id} connected")
        
        while True:
            try:
                data = await websocket.receive_json()
                if room_id not in meeting_manager.rooms:
                    logger.warning(f"Room not found for client {room_id}")
                    continue
                    
                await meeting_manager.rooms[room_id].broadcast(data, websocket)
                
            except ValueError as e:
                logger.error(f"Invalid message format from client {room_id}: {str(e)}")
                continue
                
    except WebSocketDisconnect:
        logger.info(f"Client {room_id} disconnected")
        meeting_manager.leave(room_id, websocket)
        
    except Exception as e:
        logger.error(f"Error handling websocket for client {room_id}: {str(e)}")
        meeting_manager.leave(room_id, websocket)
