import { findUserCaseOrThrow } from './caseController.js';
import { Analysis } from '../models/Analysis.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { analyzeCase, answerCaseQuestion } from '../services/geminiService.js';
import { ChatInputSchema } from '../validators/caseValidators.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export async function runAnalysis(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);

    if ((!investigation.clues || investigation.clues.length === 0) && (!investigation.suspects || investigation.suspects.length === 0)) {
      throw new ValidationError('Please add at least one suspect or clue before running AI detective analysis.');
    }

    // Call Gemini Detective Service
    const aiResult = await analyzeCase(investigation);

    const nextVersion = (investigation.analysisVersion || 0) + 1;

    // Create Analysis Record
    const analysisRecord = await Analysis.create({
      caseId: investigation._id,
      version: nextVersion,
      summary: aiResult.summary,
      conclusion: aiResult.conclusion,
      supportingEvidence: aiResult.supportingEvidence || [],
      contradictions: aiResult.contradictions || [],
      suspectAssessments: aiResult.suspectAssessments || [],
      alternativeHypotheses: aiResult.alternativeHypotheses || [],
      timelineChronology: aiResult.timelineChronology || [],
      missingInformation: aiResult.missingInformation || [],
      nextSteps: aiResult.nextSteps || [],
      limitations: aiResult.limitations || [],
    });

    // Update Case reference
    investigation.latestAnalysisId = analysisRecord._id;
    investigation.analysisVersion = nextVersion;
    investigation.isAnalysisStale = false;
    if (aiResult.conclusion?.status === 'Strongly supported') {
      investigation.investigationStatus = 'Solved';
    } else if (investigation.investigationStatus === 'Open') {
      investigation.investigationStatus = 'Under Investigation';
    }

    await investigation.save();

    res.status(200).json({
      success: true,
      message: `Analysis v${nextVersion} completed successfully`,
      analysis: analysisRecord,
      case: investigation,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLatestAnalysis(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);

    if (!investigation.latestAnalysisId) {
      return res.status(200).json({
        success: true,
        analysis: null,
        message: 'No analysis has been generated for this case yet',
      });
    }

    const analysis = await Analysis.findById(investigation.latestAnalysisId);
    if (!analysis) {
      throw new NotFoundError('Latest analysis record not found');
    }

    res.status(200).json({
      success: true,
      analysis,
      isAnalysisStale: investigation.isAnalysisStale,
      version: analysis.version,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnalysisHistory(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);

    const history = await Analysis.find({ caseId: investigation._id })
      .sort({ version: -1 })
      .lean();

    res.status(200).json({
      success: true,
      history,
      total: history.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function sendChatMessage(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    const { message } = ChatInputSchema.parse(req.body);

    // Fetch conversation history
    const history = await ChatMessage.find({ caseId: investigation._id })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    // Query AI Detective
    const aiReply = await answerCaseQuestion(investigation, history, message);

    // Save user message
    const userMsg = await ChatMessage.create({
      caseId: investigation._id,
      userId: req.user._id,
      role: 'user',
      content: message,
    });

    // Save assistant reply
    const assistantMsg = await ChatMessage.create({
      caseId: investigation._id,
      userId: req.user._id,
      role: 'assistant',
      content: aiReply,
    });

    res.status(201).json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (err) {
    next(err);
  }
}

export async function getChatHistory(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);

    const messages = await ChatMessage.find({ caseId: investigation._id })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      messages,
      total: messages.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCaseReport(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    await investigation.populate('latestAnalysisId');

    const reportData = {
      application: 'AI Mystery Room — Detective & Case Solver',
      generatedAt: new Date().toISOString(),
      case: {
        id: investigation._id,
        title: investigation.title,
        category: investigation.category,
        description: investigation.description,
        incidentDate: investigation.incidentDate,
        location: investigation.location,
        investigationObjective: investigation.investigationObjective,
        investigationStatus: investigation.investigationStatus,
        createdAt: investigation.createdAt,
        updatedAt: investigation.updatedAt,
      },
      suspects: investigation.suspects || [],
      clues: investigation.clues || [],
      analysis: investigation.latestAnalysisId || null,
      isAnalysisStale: investigation.isAnalysisStale,
      disclaimer: 'This dossier was generated using algorithmic forensic analysis. For real-world incidents, all findings represent investigative hypotheses and do not constitute legal proof of guilt.',
    };

    res.status(200).json({
      success: true,
      report: reportData,
    });
  } catch (err) {
    next(err);
  }
}
