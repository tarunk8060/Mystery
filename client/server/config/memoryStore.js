import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Case } from '../models/Case.js';
import { Analysis } from '../models/Analysis.js';
import { ChatMessage } from '../models/ChatMessage.js';

export const inMemoryStore = {
  users: new Map(),
  cases: new Map(),
  analyses: new Map(),
  chatMessages: new Map(),
  isFallbackActive: false,
};

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

export function activateInMemoryFallback() {
  if (inMemoryStore.isFallbackActive) return;
  inMemoryStore.isFallbackActive = true;
  console.log('⚡ [IN-MEMORY DATABASE] Local MongoDB not detected. Running with in-memory development database.');

  // Pre-seed a demo detective account so user can login immediately or register
  const demoSalt = bcrypt.genSaltSync(10);
  const demoHash = bcrypt.hashSync('Sherlock123!', demoSalt);
  const demoId = generateId();
  const demoUser = {
    _id: new mongoose.Types.ObjectId(demoId),
    name: 'Inspector Holmes',
    email: 'detective@mystery.com',
    passwordHash: demoHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryStore.users.set(demoId, demoUser);

  // --- Override User Model ---
  User.findOne = async (filter) => {
    if (filter?.email) {
      for (const u of inMemoryStore.users.values()) {
        if (u.email.toLowerCase() === filter.email.toLowerCase()) {
          return createMockUserDoc(u);
        }
      }
    }
    return null;
  };

  User.findById = (id) => {
    const u = inMemoryStore.users.get(id?.toString());
    const doc = u ? createMockUserDoc(u) : null;
    return {
      select: () => Promise.resolve(doc),
      then: (resolve) => resolve(doc),
    };
  };

  User.create = async (data) => {
    const id = generateId();
    const newUser = {
      _id: new mongoose.Types.ObjectId(id),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.users.set(id, newUser);
    return createMockUserDoc(newUser);
  };

  function createMockUserDoc(userData) {
    return {
      ...userData,
      comparePassword: async (candidate) => bcrypt.compare(candidate, userData.passwordHash),
      toSafeObject: () => ({
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }),
      save: async function () {
        inMemoryStore.users.set(userData._id.toString(), { ...userData, ...this });
        return this;
      },
    };
  }

  // --- Override Case Model ---
  Case.create = async (data) => {
    const id = generateId();
    const suspects = (data.suspects || []).map(s => ({
      _id: s._id || new mongoose.Types.ObjectId(),
      ...s,
      createdAt: new Date(),
    }));
    const clues = (data.clues || []).map(c => ({
      _id: c._id || new mongoose.Types.ObjectId(),
      ...c,
      createdAt: new Date(),
    }));

    const newCase = {
      _id: new mongoose.Types.ObjectId(id),
      ...data,
      suspects,
      clues,
      analysisVersion: data.analysisVersion || 0,
      isAnalysisStale: data.isAnalysisStale || false,
      investigationStatus: data.investigationStatus || 'Open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.cases.set(id, newCase);
    return createMockCaseDoc(newCase);
  };

  Case.findById = (id) => {
    const caseItem = inMemoryStore.cases.get(id?.toString());
    const doc = caseItem ? createMockCaseDoc(caseItem) : null;
    return Promise.resolve(doc);
  };

  Case.findByIdAndDelete = async (id) => {
    const caseItem = inMemoryStore.cases.get(id?.toString());
    inMemoryStore.cases.delete(id?.toString());
    return caseItem;
  };

  Case.find = (filter) => {
    let results = Array.from(inMemoryStore.cases.values());
    if (filter?.createdBy) {
      results = results.filter(c => c.createdBy?.toString() === filter.createdBy.toString());
    }
    if (filter?.category && filter.category !== 'All') {
      results = results.filter(c => c.category === filter.category);
    }
    if (filter?.investigationStatus && filter.investigationStatus !== 'All') {
      results = results.filter(c => c.investigationStatus === filter.investigationStatus);
    }
    if (filter?.$or) {
      // Simple search filter matching title or description
      results = results.filter(c => {
        return filter.$or.some(condition => {
          if (condition.title?.$regex) {
            return new RegExp(condition.title.$regex, 'i').test(c.title);
          }
          if (condition.description?.$regex) {
            return new RegExp(condition.description.$regex, 'i').test(c.description);
          }
          return false;
        });
      });
    }

    return {
      sort: () => ({
        populate: () => ({
          lean: async () => results.map(c => {
            const copy = { ...c };
            if (copy.latestAnalysisId) {
              copy.latestAnalysisId = inMemoryStore.analyses.get(copy.latestAnalysisId.toString()) || copy.latestAnalysisId;
            }
            return copy;
          }),
        }),
      }),
    };
  };

  function createMockCaseDoc(caseData) {
    const doc = {
      ...caseData,
      populate: async function () {
        if (this.latestAnalysisId) {
          const analysis = inMemoryStore.analyses.get(this.latestAnalysisId.toString());
          this.latestAnalysisId = analysis || null;
        }
        return this;
      },
      save: async function () {
        inMemoryStore.cases.set(caseData._id.toString(), {
          ...caseData,
          ...this,
          updatedAt: new Date(),
        });
        return this;
      },
    };

    doc.suspects = (caseData.suspects || []).map(s => ({
      ...s,
      _id: s._id || new mongoose.Types.ObjectId(),
    }));
    doc.suspects.push = function (item) {
      const withId = {
        _id: item._id || new mongoose.Types.ObjectId(),
        ...item,
        createdAt: new Date(),
      };
      Array.prototype.push.call(this, withId);
      return this.length;
    };
    doc.suspects.id = function (subId) {
      return this.find(s => s._id.toString() === subId.toString()) || null;
    };
    doc.suspects.pull = function (filter) {
      const idx = this.findIndex(s => s._id.toString() === filter._id.toString());
      if (idx !== -1) this.splice(idx, 1);
    };

    doc.clues = (caseData.clues || []).map(c => ({
      ...c,
      _id: c._id || new mongoose.Types.ObjectId(),
    }));
    doc.clues.push = function (item) {
      const withId = {
        _id: item._id || new mongoose.Types.ObjectId(),
        ...item,
        createdAt: new Date(),
      };
      Array.prototype.push.call(this, withId);
      return this.length;
    };
    doc.clues.id = function (subId) {
      return this.find(c => c._id.toString() === subId.toString()) || null;
    };
    doc.clues.pull = function (filter) {
      const idx = this.findIndex(c => c._id.toString() === filter._id.toString());
      if (idx !== -1) this.splice(idx, 1);
    };

    return doc;
  }

  // --- Override Analysis Model ---
  Analysis.create = async (data) => {
    const id = generateId();
    const newAnalysis = {
      _id: new mongoose.Types.ObjectId(id),
      ...data,
      createdAt: new Date(),
    };
    inMemoryStore.analyses.set(id, newAnalysis);
    return newAnalysis;
  };

  Analysis.findById = async (id) => {
    return inMemoryStore.analyses.get(id?.toString()) || null;
  };

  Analysis.find = (filter) => {
    let results = Array.from(inMemoryStore.analyses.values());
    if (filter?.caseId) {
      results = results.filter(a => a.caseId?.toString() === filter.caseId.toString());
    }
    return {
      sort: () => ({
        lean: async () => results,
      }),
    };
  };

  Analysis.deleteMany = async (filter) => {
    if (filter?.caseId) {
      for (const [id, a] of inMemoryStore.analyses.entries()) {
        if (a.caseId?.toString() === filter.caseId.toString()) {
          inMemoryStore.analyses.delete(id);
        }
      }
    }
    return { acknowledged: true };
  };

  // --- Override ChatMessage Model ---
  ChatMessage.create = async (data) => {
    const id = generateId();
    const newMsg = {
      _id: new mongoose.Types.ObjectId(id),
      ...data,
      createdAt: new Date(),
    };
    inMemoryStore.chatMessages.set(id, newMsg);
    return newMsg;
  };

  ChatMessage.find = (filter) => {
    let results = Array.from(inMemoryStore.chatMessages.values());
    if (filter?.caseId) {
      results = results.filter(m => m.caseId?.toString() === filter.caseId.toString());
    }
    return {
      sort: () => ({
        limit: () => ({
          lean: async () => results,
        }),
        lean: async () => results,
      }),
    };
  };

  ChatMessage.deleteMany = async (filter) => {
    if (filter?.caseId) {
      for (const [id, m] of inMemoryStore.chatMessages.entries()) {
        if (m.caseId?.toString() === filter.caseId.toString()) {
          inMemoryStore.chatMessages.delete(id);
        }
      }
    }
    return { acknowledged: true };
  };
}
