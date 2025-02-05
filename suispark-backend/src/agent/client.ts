import { Character, IAgentRuntime } from '@elizaos/core';
import { Scraper } from 'agent-twitter-client';

export async function initializeClients(character: Character, runtime: IAgentRuntime) {
  const clients = new Map<string, Scraper>();
  return clients;
}
