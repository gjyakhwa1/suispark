import { model, Schema } from 'mongoose';
import { Character } from '@elizaos/core';

export interface CharacterExt extends Character {
  agentId: string;
  status: 'on' | 'off';
}

const updatedCharacterSchema: Schema<CharacterExt> = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    agentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['on', 'off'],
    },
    name: {
      type: String,
      required: true,
    },
    plugins: {
      type: [String],
      default: [],
    },
    clients: {
      type: [String],
      default: [],
    },
    modelProvider: {
      type: String,
      required: true,
    },
    // settings: {
    //   type: Object,
    // },
    system: {
      type: String,
      required: false,
    },
    bio: {
      type: [String],
      default: [],
    },
    lore: {
      type: [String],
      default: [],
    },
    messageExamples: {
      type: [Object],
      default: [],
    },
    postExamples: {
      type: [String],
      default: [],
    },
    topics: {
      type: [String],
      default: [],
    },
    style: {
      type: Object,
      default: {
        all: [],
        chat: [],
        post: [],
      },
    },
    adjectives: {
      type: [String],
      default: [],
    },
    knowledge: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const charactersModel = model<CharacterExt>('AICharacters', updatedCharacterSchema);

export default charactersModel;
