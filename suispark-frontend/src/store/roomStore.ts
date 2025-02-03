import { create } from 'zustand';
import { Room, Message } from '../types/room';

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  addRoom: (room: Room) => void;
  setCurrentRoom: (room: Room) => void;
  addMessage: (message: Message) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));