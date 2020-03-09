interface Analysis {
  _id: string;
  scheduledEvents: ScheduledEvent[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ScheduledEvent {
  date: string;
  historyEvents: HistoryEvent[];
  _id: string;
  title: string;
  team1: string;
  team2: string;
  fsId: string;
  matchDetailsLink: string;
}

interface HistoryEvent {
  date: string;
  goals: Goal[];
  goalsAtRoundsEnd: Goal[];
  _id: string;
  team1: string;
  team2: string;
  title: string;
  fsId: string;
  matchDetailsLink: string;
}

interface Goal {
  _id: string;
  minute: string;
  wasScored: boolean;
}
