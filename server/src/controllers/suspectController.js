import { findUserCaseOrThrow } from './caseController.js';
import { SuspectInputSchema } from '../validators/caseValidators.js';
import { NotFoundError } from '../utils/errors.js';

export async function addSuspect(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    const validatedData = SuspectInputSchema.parse(req.body);

    investigation.suspects.push(validatedData);
    if (investigation.latestAnalysisId) {
      investigation.isAnalysisStale = true;
    }

    await investigation.save();
    const addedSuspect = investigation.suspects[investigation.suspects.length - 1];

    res.status(201).json({
      success: true,
      message: 'Suspect added successfully',
      suspect: addedSuspect,
      isAnalysisStale: investigation.isAnalysisStale,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSuspect(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    const suspect = investigation.suspects.id(req.params.suspectId);

    if (!suspect) {
      throw new NotFoundError('Suspect not found in this investigation');
    }

    const validatedData = SuspectInputSchema.partial().parse(req.body);
    Object.assign(suspect, validatedData);

    if (investigation.latestAnalysisId) {
      investigation.isAnalysisStale = true;
    }

    await investigation.save();

    res.status(200).json({
      success: true,
      message: 'Suspect updated successfully',
      suspect,
      isAnalysisStale: investigation.isAnalysisStale,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteSuspect(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    const suspect = investigation.suspects.id(req.params.suspectId);

    if (!suspect) {
      throw new NotFoundError('Suspect not found in this investigation');
    }

    investigation.suspects.pull({ _id: req.params.suspectId });
    if (investigation.latestAnalysisId) {
      investigation.isAnalysisStale = true;
    }

    await investigation.save();

    res.status(200).json({
      success: true,
      message: 'Suspect removed from investigation',
      deletedSuspectId: req.params.suspectId,
      isAnalysisStale: investigation.isAnalysisStale,
    });
  } catch (err) {
    next(err);
  }
}
