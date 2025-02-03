import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import usersModel from '../models/user.model.js';
import { Room } from '../models/room.model.js';

export class UserController {
  public createUser = async (req: Request, res: Response) => {
    try {
      const user = req.body;
      if (!user) {
        res.status(400).json({
          error: 'Invalid request!',
        });
        return;
      }
      let newUser = null;

      try {
        newUser = {
          ...user,
        };
        const insertedUser = await usersModel.create(newUser);
        res.status(200).json({ user: insertedUser, error: null });
      } catch (error) {
        res.status(200).json({ user: [], error: 'Error creating user ' + error.toString() });
      }
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public createRoom = async (req: Request, res: Response) => {
    try {
      const roomDetails = req.body;
      if (!roomDetails) {
        res.status(400).json({
          error: 'Invalid request!',
        });
        return;
      }
      const walletAddress = roomDetails.walletAddress;
      const existingUser = await usersModel.findOne({ walletAddress });

      if (!existingUser) {
        res.status(400).json({
          error: `User with wallet address ${walletAddress} not found.`,
        });
        return;
      }
      const hasActiveRoom = existingUser.rooms.some((room: Room) => room.active);
      if (hasActiveRoom) {
        res.status(400).json({
          error: `User with wallet address ${walletAddress}  already has an active room.`,
        });
        return;
      }
      let newRoom = null;
      try {
        const { walletAddress, ...roomParams } = roomDetails;
        newRoom = {
          proposal: roomParams,
        };
        await usersModel.updateOne({ walletAddress }, { $push: { rooms: newRoom } });

        res.status(200).json({ room: newRoom, error: null });
      } catch (error) {
        res.status(200).json({ room: null, error: 'Error creating room ' + error.toString() });
      }
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };
}
