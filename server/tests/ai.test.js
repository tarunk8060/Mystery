import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { AIAnalysisOutputSchema } from '../src/validators/caseValidators.js';
import * as geminiService from '../src/services/geminiService.js';

describe('AI Analysis & Interrogation Engine', () => {
  let userToken;
  let caseId;

  const validSampleAnalysis = {
    summary: 'The evidence strongly indicates an inside job during the estate gala.',
    conclusion: {
      status: 'Strongly supported',
      hypothesis: 'Arthur Pendelton used the duplicate vault key during the storm.',
      confidence: 'high',
      explanation: 'Boot prints match Arthur’s boots and the timeline contradicts his alibi.',
      primaryCulpritOrCause: 'Arthur Pendelton',
    },
    supportingEvidence: [
      {
        clueCode: 'CLUE-1',
        relevance: 'Size 10 boot prints match Arthur’s footwear found in mud.',
      },
    ],
    contradictions: [
      {
        description: 'Arthur claimed he was reading in conservatory, but lights were out at 9:30 PM.',
        involvedSuspects: ['Arthur Pendelton'],
        conflictingClueCodes: ['CLUE-1'],
      },
    ],
    suspectAssessments: [
      {
        suspectName: 'Arthur Pendelton',
        alibiStatus: 'Contradicted',
        plausibilitySummary: 'Had motive and opportunity; alibi refuted by gardener statement.',
        keyDiscrepancies: ['Conservatory lights were off during claimed reading time.'],
      },
    ],
    alternativeHypotheses: [
      {
        hypothesis: 'Outside intruder climbed the trellis.',
        likelihood: 'low',
        counterEvidence: ['Window latches were locked from inside.'],
      },
    ],
    timelineChronology: [
      {
        time: '09:00 PM',
        event: 'Vault was checked and locked.',
        sourceClueCode: 'CLUE-1',
      },
    ],
    missingInformation: ['Fingerprint analysis on vault dial.'],
    nextSteps: ['Subpoena financial records of Arthur Pendelton.'],
    limitations: ['Weather conditions degraded exterior footprints.'],
  };

  beforeEach(async () => {
    // Register user
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Agent Cooper',
      email: 'cooper@twinpeaks.fbi.gov',
      password: 'DamnGoodCoffee123',
    });
    userToken = userRes.body.token;

    // Create case with 1 suspect and 1 clue
    const caseRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'The Great Manor Robbery',
        category: 'Theft',
        description: 'A priceless artifact disappeared during the gala.',
        suspects: [
          {
            name: 'Arthur Pendelton',
            statement: 'I was reading in the library all evening.',
            alibi: 'Gardener saw me.',
          },
        ],
        clues: [
          {
            description: 'Muddy boots outside window.',
            type: 'Physical evidence',
          },
        ],
      });

    caseId = caseRes.body.case._id;
  });

  describe('Zod Schema Verification', () => {
    it('should validate a compliant structured AI analysis payload', () => {
      const result = AIAnalysisOutputSchema.safeParse(validSampleAnalysis);
      expect(result.success).toBe(true);
    });

    it('should reject invalid conclusion status enum', () => {
      const invalid = {
        ...validSampleAnalysis,
        conclusion: {
          ...validSampleAnalysis.conclusion,
          status: 'Definitely 100% Guilty Without Doubt', // Not an allowed enum
        },
      };

      const result = AIAnalysisOutputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('AI Endpoints with Mocked Service', () => {
    it('should execute analysis, persist record, and update case status', async () => {
      vi.spyOn(geminiService, 'analyzeCase').mockResolvedValue(validSampleAnalysis);

      const res = await request(app)
        .post(`/api/cases/${caseId}/analyze`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.analysis).toHaveProperty('_id');
      expect(res.body.analysis.version).toBe(1);
      expect(res.body.analysis.conclusion.status).toBe('Strongly supported');
      expect(res.body.case.isAnalysisStale).toBe(false);

      // Verify retrieving the latest analysis
      const fetchLatest = await request(app)
        .get(`/api/cases/${caseId}/analysis`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(fetchLatest.status).toBe(200);
      expect(fetchLatest.body.analysis.version).toBe(1);
    });

    it('should handle interrogation chat and maintain conversation history', async () => {
      vi.spyOn(geminiService, 'answerCaseQuestion').mockResolvedValue(
        'Based on CLUE-1, the muddy boot prints directly undermine Arthur’s claim.'
      );

      const chatRes = await request(app)
        .post(`/api/cases/${caseId}/chat`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'What contradicts Arthur’s story?' });

      expect(chatRes.status).toBe(201);
      expect(chatRes.body.userMessage.content).toBe('What contradicts Arthur’s story?');
      expect(chatRes.body.assistantMessage.content).toContain('CLUE-1');

      // Verify conversation history
      const historyRes = await request(app)
        .get(`/api/cases/${caseId}/chat`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.messages).toHaveLength(2);
    });

    it('should compile a complete printable investigation dossier report', async () => {
      vi.spyOn(geminiService, 'analyzeCase').mockResolvedValue(validSampleAnalysis);

      // Run analysis first
      await request(app)
        .post(`/api/cases/${caseId}/analyze`)
        .set('Authorization', `Bearer ${userToken}`);

      // Fetch Report
      const reportRes = await request(app)
        .get(`/api/cases/${caseId}/report`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(reportRes.status).toBe(200);
      expect(reportRes.body.success).toBe(true);
      expect(reportRes.body.report).toHaveProperty('case');
      expect(reportRes.body.report).toHaveProperty('analysis');
      expect(reportRes.body.report.analysis.conclusion.primaryCulpritOrCause).toBe('Arthur Pendelton');
      expect(reportRes.body.report).toHaveProperty('disclaimer');
    });
  });
});
