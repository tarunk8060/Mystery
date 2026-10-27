import mongoose from 'mongoose';

export const SuspectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Suspect name is required'],
      trim: true,
      maxlength: [150, 'Suspect name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    statement: {
      type: String,
      required: [true, 'Suspect statement or testimony is required'],
      maxlength: [3000, 'Statement cannot exceed 3000 characters'],
    },
    alibi: {
      type: String,
      default: '',
      maxlength: [2000, 'Alibi cannot exceed 2000 characters'],
    },
    backgroundInformation: {
      type: String,
      default: '',
      maxlength: [2000, 'Background information cannot exceed 2000 characters'],
    },
    relatedClueIds: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export const ClueSchema = new mongoose.Schema(
  {
    clueCode: {
      type: String,
      required: [true, 'Clue code is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Clue description is required'],
      maxlength: [3000, 'Clue description cannot exceed 3000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Evidence type is required'],
      enum: [
        'Physical evidence',
        'Digital evidence',
        'Witness statement',
        'Timeline',
        'Document',
        'Circumstantial evidence',
        'Other',
      ],
      default: 'Physical evidence',
    },
    source: {
      type: String,
      default: '',
      maxlength: [250, 'Source cannot exceed 250 characters'],
    },
    timestamp: {
      type: String,
      default: '',
      maxlength: [100, 'Timestamp cannot exceed 100 characters'],
    },
    relatedSuspectNames: [{
      type: String,
      trim: true,
    }],
    verificationStatus: {
      type: String,
      required: true,
      enum: [
        'User-provided',
        'Unverified',
        'Corroborated',
        'Contradicted',
        'Inconclusive',
      ],
      default: 'User-provided',
    },
  },
  {
    timestamps: true,
  }
);

const CaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
      maxlength: [200, 'Case title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Case category is required'],
      enum: [
        'Theft',
        'Missing object',
        'Fictional murder mystery',
        'Cyber mystery',
        'Fraud',
        'General mystery',
        'Other',
      ],
      default: 'General mystery',
    },
    description: {
      type: String,
      required: [true, 'Case description is required'],
      maxlength: [10000, 'Case description cannot exceed 10000 characters'],
    },
    incidentDate: {
      type: String,
      default: '',
      maxlength: [100, 'Incident date cannot exceed 100 characters'],
    },
    location: {
      type: String,
      default: '',
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    investigationObjective: {
      type: String,
      default: '',
      maxlength: [1000, 'Investigation objective cannot exceed 1000 characters'],
    },
    investigationStatus: {
      type: String,
      enum: ['Open', 'Under Investigation', 'Solved', 'Cold Case'],
      default: 'Open',
    },
    suspects: [SuspectSchema],
    clues: [ClueSchema],
    latestAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      default: null,
    },
    isAnalysisStale: {
      type: Boolean,
      default: false,
    },
    analysisVersion: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query sorting
CaseSchema.index({ createdBy: 1, createdAt: -1 });
CaseSchema.index({ createdBy: 1, updatedAt: -1 });

export const Case = mongoose.model('Case', CaseSchema);
