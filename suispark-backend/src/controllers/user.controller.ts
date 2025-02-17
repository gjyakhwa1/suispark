import { Request, Response } from 'express';
import usersModel from '../models/user.model.js';
import { Room } from '../models/room.model.js';
import { AgentRuntime, embed } from '@elizaos/core';
import { ORCHESTRATOR_NAME, PROPOSAL_SIMILARITY_THRESHOLD } from '../constant.js';
import { getYoutubeVideoTranscript } from '../services/youtubeTranscript.service.js';

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
      const existingUser = await usersModel.findOne({ walletAddress: user.walletAddress });
      if (existingUser) {
        res.status(200).json({
          user: existingUser,
          error: null,
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
      const { walletAddress, projectId, abstract, title, demoLink } = req.body;

      if (!walletAddress || !abstract || !title || !demoLink) {
        res.status(400).json({
          error: 'Invalid request!. Please include walletAddress, abstract, demoLink and title',
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

      const demoVideoTranscript = await getYoutubeVideoTranscript(demoLink);
      const roomManagerRuntime = Array.from(global.agentsInMemory.values()).filter(
        (agent: AgentRuntime) => agent.character.name === ORCHESTRATOR_NAME,
      )[0] as AgentRuntime;

      const messageEmbeddings = await embed(roomManagerRuntime, abstract);
      const similarProposal = await global.db.searchMemoriesByEmbedding(messageEmbeddings, {
        tableName: 'messages',
        agentId: roomManagerRuntime.agentId,
      });
      const similarProposalBelowThreshold = similarProposal.filter(proposal => proposal.similarity <= PROPOSAL_SIMILARITY_THRESHOLD);
      if (similarProposalBelowThreshold && similarProposalBelowThreshold.length > 0) {
        res.status(400).json({
          message: '',
          error: 'Proposal with similar idea has already been submitted.',
        });
        return;
      }

      let newRoom = null;
      const roomId = await global.db.createRoom();
      try {
        const roomParams = { abstract, title, demoLink, demoVideoTranscript };
        newRoom = {
          proposal: roomParams,
          id: roomId,
          projectId,
        };
        await usersModel.updateOne({ walletAddress }, { $push: { rooms: newRoom } });

        res.status(200).json({ room: newRoom, error: null });
      } catch (error) {
        res.status(200).json({ room: null, error: 'Error creating room ' + error.toString() });
      }
    } catch (e) {
      console.log(e)
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public getRooms = async (req: Request, res: Response) => {
    try {
      const walletAddress = req.params.walletAddress;
      if (!walletAddress) {
        res.status(400).json({
          error: 'Invalid request!. Please include walletAddress',
        });
        return;
      }
      const userRooms = await usersModel.findOne({ walletAddress: walletAddress });
      res.status(200).json({ rooms: userRooms.rooms, walletAddress: walletAddress, error: null });
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };
}
