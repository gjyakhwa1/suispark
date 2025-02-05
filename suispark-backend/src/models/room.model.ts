import { Schema } from 'mongoose';

interface Proposal {
  abstract: string;
  teamDetails: string;
  timeLine: string;
}
export interface Room {
  id: string;
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
    teamDetails: {
      type: String,
      required: true,
    },
    timeLine: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

export const RoomSchema = new Schema<Room>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
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
