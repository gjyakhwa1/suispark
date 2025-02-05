import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import usersModel from '../models/user.model.js';
import { Room } from '../models/room.model.js';
import { initializeDatabase } from '../agent/database.js';
import fs from 'fs';
import path from 'path';

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
      const { walletAddress, abstract, teamDetails } = req.body;

      if (!walletAddress || !abstract || !teamDetails) {
        res.status(400).json({
          error: 'Invalid request!. Please include walletAddress, abstract and teamDetails',
        });
        return;
      }
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
      // create room
      const dataDir = path.join(global.__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const db = initializeDatabase(dataDir);

      const roomId = await db.createRoom();
      try {
        const roomParams = { abstract, teamDetails };
        newRoom = {
          proposal: roomParams,
          id: roomId,
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
