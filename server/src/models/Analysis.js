import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    summary: {
      type: String,
      required: true,
    },
    conclusion: {
      status: {
        type: String,
        required: true,
        enum: [
          'Strongly supported',
          'Plausible but unconfirmed',
          'Inconclusive',
          'Contradicted by available evidence',
        ],
      },
      hypothesis: {
        type: String,
        required: true,
      },
      confidence: {
        type: String,
        required: true,
        enum: ['high', 'medium', 'low'],
      },
      explanation: {
        type: String,
        required: true,
      },
      primaryCulpritOrCause: {
        type: String,
        default: 'Undetermined',
      },
    },
    supportingEvidence: [
      {
        clueCode: { type: String, required: true },
        relevance: { type: String, required: true },
      },
    ],
    contradictions: [
      {
        description: { type: String, required: true },
        involvedSuspects: [{ type: String }],
        conflictingClueCodes: [{ type: String }],
      },
    ],
    suspectAssessments: [
      {
        suspectName: { type: String, required: true },
        alibiStatus: {
          type: String,
          enum: ['Corroborated', 'Questionable', 'Contradicted', 'Unverified'],
          default: 'Unverified',
        },
        plausibilitySummary: { type: String, required: true },
        keyDiscrepancies: [{ type: String }],
      },
    ],
    alternativeHypotheses: [
      {
        hypothesis: { type: String, required: true },
        likelihood: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'low',
        },
        counterEvidence: [{ type: String }],
      },
    ],
    timelineChronology: [
      {
        time: { type: String, required: true },
        event: { type: String, required: true },
        sourceClueCode: { type: String, default: '' },
      },
    ],
    missingInformation: [{ type: String }],
    nextSteps: [{ type: String }],
    limitations: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

AnalysisSchema.index({ caseId: 1, version: -1 });

export const Analysis = mongoose.model('Analysis', AnalysisSchema);
