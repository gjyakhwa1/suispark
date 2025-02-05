import { AgentRuntime, composeContext, Content, generateText, Memory, ModelClass } from '@elizaos/core';
import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { startAgent } from '../agent/agent.js';
import { sharkCounterQuestionTemplate, sharkEvaluationTemplate } from '../agent/constant.js';
import charactersModel from '../models/character.model.js';
import usersModel from '../models/user.model.js';
import { NUMBER_OF_ROUND, ORCHESTRATOR_NAME } from '../constant.js';

export class AgentController {
  public createAgent = async (req: Request, res: Response) => {
    try {
      const id = crypto.randomUUID();
      const character = req.body;
      if (!character) {
        res.status(400).json({
          error: 'Invalid request!',
        });
      }
      let newCharacterData = null;

      try {
        newCharacterData = {
          ...character,
          id: id,
          agentId: id,
          status: 'on',
          modelProvider: 'openai',
        };
        await charactersModel.create(newCharacterData);
        res.status(200).json({ agents: newCharacterData, error: null });
      } catch (error) {
        res.status(200).json({ agents: [], error: 'Error creating agent ' + error.toString() });
      }
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public getAllAgents = async (req: Request, res: Response) => {
    try {
      const agentsList = Array.from(global.agentsInMemory.values()).map((agent: AgentRuntime) => {
        const { settings, ...restOfCharacter } = agent.character;
        return {
          id: agent.agentId,
          character: {
            ...restOfCharacter,
          },
          clients: Object.keys(agent.clients),
        };
      });

      res.status(200).json({ agents: agentsList, error: null });
    } catch (error) {
      res.status(200).json({ agents: [], error: 'Error fetching agents ' + error.toString() });
    }
  };

  public chatOrchestrator = async (req: Request, res: Response) => {
    try {
      const selectRandomAgent = (): AgentRuntime => {
        const agentIds = Array.from(global.agentsInMemory.values())
          .filter((agent: AgentRuntime) => agent.character.name !== ORCHESTRATOR_NAME)
          .map((agent: AgentRuntime) => {
            return agent.agentId;
          });
        const noOfAgents = agentIds.length;
        const randomIndex = Math.floor(Math.random() * noOfAgents);
        const agentId = agentIds[randomIndex];
        const agentRuntime = global.agentsInMemory.get(agentId);
        return agentRuntime;
      };

      const getChatHistory = (chatHistory: Memory[]) =>
        chatHistory.reduce((acc, message) => acc + `${message.content.source}:${message.content.text}\n\n`, '');

      const checkForCompletion = (chatHistoryLength: number): boolean => {
        if (chatHistoryLength >= NUMBER_OF_ROUND) {
          return true;
        }
        return false;
      };

      const message = req.body.message;
      const roomId = req.body.roomId;

      if (!message || !roomId) {
        res.status(400).json({
          error: 'Invalid Request.',
        });
        return;
      }

      //binding roomManager runtime to roomId to acces all the memory in the room
      const roomManagerRuntime = Array.from(global.agentsInMemory.values()).filter(
        (agent: AgentRuntime) => agent.character.name === ORCHESTRATOR_NAME,
      )[0] as AgentRuntime;
      await global.db.addParticipant(roomManagerRuntime.agentId, roomId);

      const agentRuntime = selectRandomAgent();

      const chatHistory = await roomManagerRuntime.messageManager.getMemoriesByRoomIds({ roomIds: [roomId] });

      const chatHistoryLength = chatHistory.length;

      //save user qeuery to roomManager Memory
      let userQueryMemory = {
        userId: roomManagerRuntime.agentId,
        agentId: roomManagerRuntime.agentId,
        roomId: roomId,
        content: {
          source: 'user',
          text: message,
        } as Content,
      };
      userQueryMemory = await roomManagerRuntime.messageManager.addEmbeddingToMemory(userQueryMemory);
      await roomManagerRuntime.messageManager.createMemory(userQueryMemory);

      if (checkForCompletion(chatHistoryLength)) {
        res.json({
          message: '',
          agent: '',
          roundFinished: true,
          error: null,
        });
        return;
      }

      let queryMemory: Memory = {
        userId: agentRuntime.agentId,
        agentId: agentRuntime.agentId,
        roomId: roomId,
        content: {
          source: 'user',
          text: message,
        } as Content,
      };
      const state = await agentRuntime.composeState(queryMemory, {
        chatHistory: `
        ${getChatHistory(chatHistory)}

        "user":${message}
        ${agentRuntime.character.name}:
        `,
      });

      let context = composeContext({
        state,
        template: sharkCounterQuestionTemplate,
      });
      const response = await generateText({
        runtime: agentRuntime,
        context: context,
        modelClass: ModelClass.SMALL,
      });

      //save agent response to roomManager Memory
      let agentResponseMemory = {
        userId: roomManagerRuntime.agentId,
        agentId: roomManagerRuntime.agentId,
        roomId: roomId,
        content: {
          source: agentRuntime.character.name,
          text: response,
        } as Content,
      };
      agentResponseMemory = await roomManagerRuntime.messageManager.addEmbeddingToMemory(agentResponseMemory);
      await roomManagerRuntime.messageManager.createMemory(agentResponseMemory);

      res.json({
        message: response,
        agent: agentRuntime.character.name,
        roundFinished: false,
        error: null,
      });
    } catch (error) {
      res.status(200).json({ message: '', error: 'Error chatting orchestrator ' + error.toString() });
    }
  };

  private getRoomHistory = async (roomId: `${string}-${string}-${string}-${string}-${string}`) => {
    const roomManagerRuntime = Array.from(global.agentsInMemory.values()).filter(
      (agent: AgentRuntime) => agent.character.name === ORCHESTRATOR_NAME,
    )[0] as AgentRuntime;
    await global.db.addParticipant(roomManagerRuntime.agentId, roomId);

    const chatHistory = (await roomManagerRuntime.messageManager.getMemoriesByRoomIds({ roomIds: [roomId] })).map(chat => chat.content);
    return chatHistory;
  };

  public getRoomChatHistory = async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId as `${string}-${string}-${string}-${string}-${string}`;

      if (!roomId) {
        res.status(400).json({
          error: 'Invalid Request.',
        });
        return;
      }
      const chatHistory = await this.getRoomHistory(roomId);
      console.log(chatHistory)
      res.json({
        messages: chatHistory,
        error: null,
      });
    } catch (error) {
      res.status(200).json({ message: '', error: 'Error chatting orchestrator ' + error.toString() });
    }
  };

  public getProposalDecision = async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId as `${string}-${string}-${string}-${string}-${string}`

      if (!roomId) {
        res.status(400).json({
          error: 'Invalid Request.',
        });
        return;
      }

      const getDecisionFromAgent = async (agentRuntime: AgentRuntime) => {
        let queryMemory: Memory = {
          userId: agentRuntime.agentId,
          agentId: agentRuntime.agentId,
          roomId: roomId,
          content: {
            source: '',
            text: '',
          } as Content,
        };
        const state = await agentRuntime.composeState(queryMemory, {
          chatHistory,
        });

        let context = composeContext({
          state,
          template: sharkEvaluationTemplate,
        });
        const response = await generateText({
          runtime: agentRuntime,
          context: context,
          modelClass: ModelClass.SMALL,
        });
        console.log(agentRuntime.character.name, response);
        if (response.toLowerCase().includes('yes')) {
          return true;
        }
        return false;
      };

      const checkDecisions = (decisions: boolean[]): boolean => {
        const numberOfTrueValues = decisions.filter(decision => decision).length;
        const numberOfFalseValues = decisions.filter(decision => !decision).length;
        if (numberOfTrueValues > numberOfFalseValues) {
          return true;
        }
        return false;
      };
      const chatHistory = await this.getRoomHistory(roomId);

      const agents = Array.from(global.agentsInMemory.values()).filter((agent: AgentRuntime) => agent.character.name !== ORCHESTRATOR_NAME);
      const decisions = await Promise.all(agents.map(getDecisionFromAgent));
      const finalDecision = checkDecisions(decisions);

      await usersModel.updateOne({ 'rooms.id': roomId }, { $set: { 'rooms.$.active': false, 'rooms.$.funded': finalDecision } });

      res.json({
        decision: finalDecision,
        error: null,
      });
    } catch (error) {
      res.status(200).json({ message: '', error: 'Error chatting orchestrator ' + error.toString() });
    }
  };

  public toggleAgent = async (req: Request, res: Response) => {
    const agentId = req.body.agentId;

    try {
      const agentCharacter = (await charactersModel.findOne({ agentId })).toObject();
      const agent: AgentRuntime = global.agentsInMemory.get(agentId);

      if (agentCharacter.status === 'on') {
        //turn off
        if (agent) {
          agent.stop();
          global.agentsInMemory.delete(agentId);
        }

        await charactersModel.findOneAndUpdate({ agentId }, { $set: { status: 'off' } });

        res.json({
          message: 'Successfully stopped!',
          error: null,
        });
      } else {
        // turn on
        if (agent) {
          agent.stop();
          global.agentsInMemory.delete(agentId);
        }

        const agentRuntime = await startAgent(agentCharacter as any);
        global.agentsInMemory.set(agentId, agentRuntime);
        await charactersModel.findOneAndUpdate({ agentId }, { $set: { status: 'on' } });
        logger.info(`${agentCharacter.name} started`);

        res.json({
          message: 'Successfully started!',
          error: null,
        });
      }
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public restartAgent = async (req: Request, res: Response) => {
    const agentId = req.body.agentId;

    const agent: AgentRuntime = global.agentsInMemory.get(agentId);

    if (!agent) {
      res.status(400).json({
        error: "Agent doesn't exist.",
      });
      return;
    }

    try {
      agent.stop();
      global.agentsInMemory.delete(agentId);

      const newAgentCharacter = (await charactersModel.findOne({ agentId })).toObject();

      const agentRuntime = await startAgent(newAgentCharacter as any);
      global.agentsInMemory.set(agentId, agentRuntime);
      logger.info(`${newAgentCharacter.name} started`);

      res.json({
        message: 'Successfully restarted!',
        error: null,
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };

  public updateAgentCharacter = async (req: Request, res: Response) => {
    const agentId = req.body.agentId;
    const character = req.body;

    const agent: AgentRuntime = global.agentsInMemory.get(agentId);

    if (!agent) {
      res.status(400).json({
        error: "Agent doesn't exist.",
      });
      return;
    }

    if (!character) {
      res.status(400).json({
        error: 'Invalid request!',
      });
    }

    try {
      agent.stop();
      global.agentsInMemory.delete(agentId);
      logger.info(`${character.name} stopped and unregistered!`);

      let updatedCharacterData = null;

      try {
        // Fetch the existing character data from the database
        const existingCharacterData = await charactersModel.findOne({ agentId });

        if (!existingCharacterData) {
          throw new Error(`Character with agentId ${(agent.character as any).agentId} not found.`);
        }

        updatedCharacterData = {
          ...existingCharacterData.toObject(),
          ...character,
          name: agent.character.name, // Preserve these parameters
          agentId: (agent.character as any).agentId,
          status: (agent.character as any).status,
          username: agent.character.username,
          plugins: agent.character.plugins,
          clients: agent.character.clients,
          modelProvider: agent.character.modelProvider,
        };

        console.log({ updatedCharacterData });

        // Update the database with the merged data
        await charactersModel.updateOne({ agentId }, { $set: updatedCharacterData });
      } catch (e) {
        logger.error(`Error updating character file: ${e}`);
        res.status(500).json({
          error: 'Error updating character file',
        });
        return;
      }

      const newAgentCharacter = {
        ...updatedCharacterData,
        settings: {
          ...updatedCharacterData.settings,
          secrets: agent.character.settings.secrets,
        },
      };

      const agentRuntime = await startAgent(newAgentCharacter);
      global.agentsInMemory.set(agentId, agentRuntime);
      logger.info(`${newAgentCharacter.name} started`);

      res.json({
        id: character.id,
        character: character,
        error: null,
      });
    } catch (e) {
      res.status(500).json({
        error: e.message,
      });
    }
  };
}
