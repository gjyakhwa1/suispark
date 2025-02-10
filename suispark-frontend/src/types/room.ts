export interface Room {
    id: string;
    abstract: string;
    teamDetails: string;
    timeline: string;
    createdAt: Date;
  }
  
  export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    roomId: string;
  }