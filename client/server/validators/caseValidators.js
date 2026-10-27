import { z } from 'zod';

export const SuspectInputSchema = z.object({
  name: z.string({ required_error: 'Suspect name is required' }).trim().min(1, 'Name is required').max(150),
  description: z.string().max(1000).default(''),
  statement: z.string({ required_error: 'Statement is required' }).trim().min(1, 'Statement is required').max(3000),
  alibi: z.string().max(2000).default(''),
  backgroundInformation: z.string().max(2000).default(''),
  relatedClueIds: z.array(z.string()).default([]),
});

export const ClueInputSchema = z.object({
  description: z.string({ required_error: 'Clue description is required' }).trim().min(1, 'Clue description is required').max(3000),
  type: z.enum([
    'Physical evidence',
    'Digital evidence',
    'Witness statement',
    'Timeline',
    'Document',
    'Circumstantial evidence',
    'Other',
  ], {
    errorMap: () => ({ message: 'Invalid evidence type' }),
  }),
  source: z.string().max(250).default(''),
  timestamp: z.string().max(100).default(''),
  relatedSuspectNames: z.array(z.string().trim()).default([]),
  verificationStatus: z.enum([
    'User-provided',
    'Unverified',
    'Corroborated',
    'Contradicted',
    'Inconclusive',
  ], {
    errorMap: () => ({ message: 'Invalid verification status' }),
  }).default('User-provided'),
});

export const CreateCaseSchema = z.object({
  title: z.string({ required_error: 'Case title is required' }).trim().min(3, 'Title must be at least 3 characters').max(200),
  category: z.enum([
    'Theft',
    'Missing object',
    'Fictional murder mystery',
    'Cyber mystery',
    'Fraud',
    'General mystery',
    'Other',
  ]),
  description: z.string({ required_error: 'Description is required' }).trim().min(10, 'Description must be at least 10 characters').max(10000),
  incidentDate: z.string().max(100).optional().default(''),
  location: z.string().max(200).optional().default(''),
  investigationObjective: z.string().max(1000).optional().default(''),
  suspects: z.array(SuspectInputSchema).default([]),
  clues: z.array(ClueInputSchema).default([]),
});

export const UpdateCaseSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  category: z.enum([
    'Theft',
    'Missing object',
    'Fictional murder mystery',
    'Cyber mystery',
    'Fraud',
    'General mystery',
    'Other',
  ]),
  description: z.string().trim().min(10).max(10000).optional(),
  incidentDate: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  investigationObjective: z.string().max(1000).optional(),
  investigationStatus: z.enum(['Open', 'Under Investigation', 'Solved', 'Cold Case']).optional(),
});

export const ChatInputSchema = z.object({
  message: z.string({ required_error: 'Message is required' }).trim().min(1, 'Message cannot be empty').max(3000),
});

// Zod Schema for Structured AI Analysis Output (Robust against nulls/omissions)
export const AIAnalysisOutputSchema = z.object({
  summary: z.string().min(5, 'Summary too brief').max(5000),
  conclusion: z.object({
    status: z.enum([
      'Strongly supported',
      'Plausible but unconfirmed',
      'Inconclusive',
      'Contradicted by available evidence',
    ]),
    hypothesis: z.string().min(3),
    confidence: z.enum(['high', 'medium', 'low']),
    explanation: z.string().min(5),
    primaryCulpritOrCause: z.string().nullable().optional().transform((v) => v || 'Undetermined'),
  }),
  supportingEvidence: z.array(
    z.object({
      clueCode: z.string(),
      relevance: z.string().min(1),
    })
  ).default([]),
  contradictions: z.array(
    z.object({
      description: z.string().min(1),
      involvedSuspects: z.array(z.string()).default([]),
      conflictingClueCodes: z.array(z.string()).default([]),
    })
  ).default([]),
  suspectAssessments: z.array(
    z.object({
      suspectName: z.string(),
      alibiStatus: z.enum(['Corroborated', 'Questionable', 'Contradicted', 'Unverified']).default('Unverified'),
      plausibilitySummary: z.string(),
      keyDiscrepancies: z.array(z.string()).default([]),
    })
  ).default([]),
  alternativeHypotheses: z.array(
    z.object({
      hypothesis: z.string(),
      likelihood: z.enum(['high', 'medium', 'low']).default('low'),
      counterEvidence: z.array(z.string()).default([]),
    })
  ).default([]),
  timelineChronology: z.array(
    z.object({
      time: z.string(),
      event: z.string(),
      sourceClueCode: z.string().nullable().optional().transform((v) => v || ''),
    })
  ).default([]),
  missingInformation: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
});
