import { findUserCaseOrThrow } from './caseController.js';
import { ClueInputSchema } from '../validators/caseValidators.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Computes the next unique sequential clue code (e.g., CLUE-1, CLUE-2).
 */
function getNextClueCode(existingClues = []) {
  let maxNumber = 0;
  for (const clue of existingClues) {
    if (clue.clueCode && clue.clueCode.startsWith('CLUE-')) {
      const numPart = parseInt(clue.clueCode.replace('CLUE-', ''), 10);
      if (!isNaN(numPart) && numPart > maxNumber) {
        maxNumber = numPart;
      }
    }
  }
  return `CLUE-${maxNumber + 1}`;
}

export async function addClue(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    const validatedData = ClueInputSchema.parse(req.body);

    const clueCode = getNextClueCode(investigation.clues);
    const clueToInsert = {
      ...validatedData,
      clueCode,
    };

    investigation.clues.push(clueToInsert);
    if (investigation.latestAnalysisId) {
      investigation.isAnalysisStale = true;
    }

    await investigation.save();
    const addedClue = investigation.clues[investigation.clues.length - 1];

    res.status(201).json({
      success: true,
      message: 'Evidence clue added to case file',
      clue: addedClue,
      isAnalysisStale: investigation.isAnalysisStale,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateClue(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    const clue = investigation.clues.id(req.params.clueId);

    if (!clue) {
      throw new NotFoundError('Clue not found in this investigation');
    }

    const validatedData = ClueInputSchema.partial().parse(req.body);
    // Disallow overriding the original clueCode to preserve deductive references
    delete validatedData.clueCode;

    Object.assign(clue, validatedData);
    if (investigation.latestAnalysisId) {
      investigation.isAnalysisStale = true;
    }

    await investigation.save();

    res.status(200).json({
      success: true,
      message: 'Clue updated successfully',
      clue,
      isAnalysisStale: investigation.isAnalysisStale,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteClue(req, res, next) {
  try {
    const investigation = await findUserCaseOrThrow(req.params.id, req.user._id);
    const clue = investigation.clues.id(req.params.clueId);

    if (!clue) {
      throw new NotFoundError('Clue not found in this investigation');
    }

    const deletedCode = clue.clueCode;
    investigation.clues.pull({ _id: req.params.clueId });
    if (investigation.latestAnalysisId) {
      investigation.isAnalysisStale = true;
    }

    await investigation.save();

    res.status(200).json({
      success: true,
      message: `Evidence ${deletedCode} removed from case file`,
      deletedClueId: req.params.clueId,
      isAnalysisStale: investigation.isAnalysisStale,
    });
  } catch (err) {
    next(err);
  }
}
