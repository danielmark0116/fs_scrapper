import { Schema, Document, model, Model } from "mongoose";

export interface GoalSchema {
  minute: string;
  wasScored: boolean;
  who: string;
}

export interface HESchema {
  title: string;
  team1: string;
  team2: string;
  fsId: string;
  matchDetailsLink: string;
  goals: any;
  goalsAtRoundsEnd: any;
}

export interface SESchema {
  title: string;
  team1: string;
  team2: string;
  fsId: string;
  matchDetailsLink: string;
  historyEvents: any[];
}

export interface ASchema extends Document {
  _id: string;
  createdAt: string;
  updatedAt: string;
  scheduledEvents: SESchema[];
}

const goal: Schema = new Schema({
  minute: String,
  wasScored: Boolean,
  who: String
});

const historyEvent: Schema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    team1: {
      type: String,
      required: true
    },
    team2: {
      type: String,
      required: true
    },
    fsId: {
      type: String,
      required: true
    },
    matchDetailsLink: {
      type: String,
      required: true
    },
    goals: [goal],
    goalsAtRoundsEnd: [goal]
  },
  { timestamps: true }
);

const scheduledEvent: Schema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    team1: {
      type: String,
      required: true
    },
    team2: {
      type: String,
      required: true
    },
    fsId: {
      type: String,
      required: true
    },
    matchDetailsLink: {
      type: String,
      required: true
    },
    historyEvents: [historyEvent]
  },
  { timestamps: true }
);

const AnalysisSchema: Schema = new Schema(
  {
    scheduledEvents: [scheduledEvent]
  },
  { timestamps: true }
);

export const Analysis: Model<ASchema> = model("Analysis", AnalysisSchema);
