import { Schema } from 'mongoose';

interface Proposal {
  abstract: string;
  title: string;
  demoLink: string;
  demoVideoTranscript:string;
}
export interface Room {
  id: string;
  projectId: string;
  active: boolean;
  funded: boolean;
  proposal: Proposal;
}

const ProposalSchema: Schema<Proposal> = new Schema(
  {
    abstract: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    demoLink: {
      type: String,
      required: true
    },
    demoVideoTranscript:{
      type: String,
      default: ""
    }
  },
  { _id: false },
);

export const RoomSchema = new Schema<Room>(
  {
    id: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    funded: {
      type: Boolean,
      required: true,
      default: false,
    },
    proposal: {
      type: ProposalSchema,
      required: true,
    },
  },
  { _id: false },
);
