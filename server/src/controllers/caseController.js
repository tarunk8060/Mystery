import mongoose from 'mongoose';
import { Case } from '../models/Case.js';
import { Analysis } from '../models/Analysis.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { CreateCaseSchema, UpdateCaseSchema } from '../validators/caseValidators.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';

/**
 * Helper to verify user ownership of a case.
 */
export async function findUserCaseOrThrow(caseId, userId) {
  if (!mongoose.Types.ObjectId.isValid(caseId)) {
    throw new ValidationError(`Invalid case ID format: ${caseId}`);
  }

  const investigation = await Case.findById(caseId);
  if (!investigation) {
    throw new NotFoundError('Investigation case not found');
  }

  if (investigation.createdBy.toString() !== userId.toString()) {
    throw new ForbiddenError('You do not have permission to access or modify this case');
  }

  return investigation;
}

export async function createCase(req, res, next) {
  try {
    const validatedData = CreateCaseSchema.parse(req.body);

    // Automatically assign clueCodes if initial clues are provided
    const cluesWithCodes = (validatedData.clues || []).map((clue, index) => ({
      ...clue,
      clueCode: `CLUE-${index + 1}`,
    }));

    const newCase = await Case.create({
      ...validatedData,
      clues: cluesWithCodes,
      createdBy: req.user._id,
      investigationStatus: 'Open',
      isAnalysisStale: false,
      analysisVersion: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      case: newCase,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCases(req, res, next) {
  try {
    const { search, category, status, sort } = req.query;
    const query = { createdBy: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.investigationStatus = status;
    }

    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'updated') {
      sortOption = { updatedAt: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const cases = await Case.find(query)
      .sort(sortOption)
      .populate('latestAnalysisId', 'conclusion summary version createdAt')
      .lean();

    const formattedCases = cases.map(c => ({
      ...c,
      id: c._id.toString(),
      suspectsCount: (c.suspects || []).length,
      cluesCount: (c.clues || []).length,
    }));

    res.status(200).json({
      success: true,
      cases: formattedCases,
      total: formattedCases.length,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCaseById(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    await investigation.populate('latestAnalysisId');

    res.status(200).json({
      success: true,
      case: investigation,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCase(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    const validatedData = UpdateCaseSchema.parse(req.body);

    const hasCoreDetailsChanged =
      (validatedData.title && validatedData.title !== investigation.title) ||
      (validatedData.category && validatedData.category !== investigation.category) ||
      (validatedData.description && validatedData.description !== investigation.description) ||
      (validatedData.investigationObjective && validatedData.investigationObjective !== investigation.investigationObjective);

    Object.assign(investigation, validatedData);

    if (hasCoreDetailsChanged && investigation.latestAnalysisId) {
      investigation.isAnalysisStale = true;
    }

    await investigation.save();

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      case: investigation,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCase(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);

    // Cascade delete associated analyses and chat messages
    await Promise.all([
      Analysis.deleteMany({ caseId: investigation._id }),
      ChatMessage.deleteMany({ caseId: investigation._id }),
      Case.findByIdAndDelete(investigation._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Investigation case and all related records deleted successfully',
      deletedCaseId: investigation._id,
    });
  } catch (err) {
    next(err);
  }
}
