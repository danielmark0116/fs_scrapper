"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const goal = new mongoose_1.Schema({
    minute: String,
    wasScored: Boolean,
    who: String
});
const historyEvent = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: ""
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
}, { timestamps: true });
const scheduledEvent = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: ""
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
}, { timestamps: true });
const AnalysisSchema = new mongoose_1.Schema({
    scheduledEvents: [scheduledEvent]
}, { timestamps: true });
exports.Analysis = mongoose_1.model("Analysis", AnalysisSchema);
//# sourceMappingURL=analysis.model.js.map