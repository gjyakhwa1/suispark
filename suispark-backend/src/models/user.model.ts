import { model, Schema } from 'mongoose';
import { Room, RoomSchema } from './room.model.js';

export interface User {
  rooms: Room[] | [];
  walletAddress: String;
}

const UserSchema: Schema<User> = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    rooms: {
      type: [RoomSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const usersModel = model<User>('Users', UserSchema);

export default usersModel;
