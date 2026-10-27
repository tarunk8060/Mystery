import { beforeAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Case } from '../src/models/Case.js';
import { Analysis } from '../src/models/Analysis.js';
import { ChatMessage } from '../src/models/ChatMessage.js';

// In-Memory Data Store for Tests
export const mockDB = {
  users: new Map(),
  cases: new Map(),
  analyses: new Map(),
  chatMessages: new Map(),
};

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_for_vitest';
  process.env.GEMINI_API_KEY = 'mock_gemini_api_key_for_testing';

  // --- Mock User Methods ---
  User.findOne = vi.fn(async (filter) => {
    if (filter?.email) {
      for (const user of mockDB.users.values()) {
        if (user.email.toLowerCase() === filter.email.toLowerCase()) {
          return createMockUserDoc(user);
        }
      }
    }
    return null;
  });

  User.findById = vi.fn((id) => {
    const user = mockDB.users.get(id?.toString());
    const doc = user ? createMockUserDoc(user) : null;
    return {
      select: vi.fn().mockResolvedValue(doc),
      then: (resolve) => resolve(doc),
    };
  });

  User.create = vi.fn(async (data) => {
    const id = generateId();
    const newUser = {
      _id: new mongoose.Types.ObjectId(id),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDB.users.set(id, newUser);
    return createMockUserDoc(newUser);
  });

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
        mockDB.users.set(userData._id.toString(), { ...userData, ...this });
        return this;
      },
    };
  }

  // --- Mock Case Methods ---
  Case.create = vi.fn(async (data) => {
    const id = generateId();
    const suspects = (data.suspects || []).map(s => ({
      _id: new mongoose.Types.ObjectId(),
      ...s,
      createdAt: new Date(),
    }));
    const clues = (data.clues || []).map(c => ({
      _id: new mongoose.Types.ObjectId(),
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
    mockDB.cases.set(id, newCase);
    return createMockCaseDoc(newCase);
  });

  Case.findById = vi.fn((id) => {
    const caseItem = mockDB.cases.get(id?.toString());
    const doc = caseItem ? createMockCaseDoc(caseItem) : null;
    return Promise.resolve(doc);
  });

  Case.findByIdAndDelete = vi.fn(async (id) => {
    const caseItem = mockDB.cases.get(id?.toString());
    mockDB.cases.delete(id?.toString());
    return caseItem;
  });

  Case.find = vi.fn((filter) => {
    let results = Array.from(mockDB.cases.values());
    if (filter?.createdBy) {
      results = results.filter(c => c.createdBy?.toString() === filter.createdBy.toString());
    }

    return {
      sort: () => ({
        populate: () => ({
          lean: async () => results,
        }),
      }),
    };
  });

  function createMockCaseDoc(caseData) {
    const doc = {
      ...caseData,
      populate: vi.fn().mockImplementation(async function () {
        if (this.latestAnalysisId) {
          const analysis = mockDB.analyses.get(this.latestAnalysisId.toString());
          this.latestAnalysisId = analysis || null;
        }
        return this;
      }),
      save: async function () {
        mockDB.cases.set(caseData._id.toString(), {
          ...caseData,
          ...this,
          updatedAt: new Date(),
        });
        return this;
      },
    };

    // Subdocument methods on suspects
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

    // Subdocument methods on clues
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

  // --- Mock Analysis Methods ---
  Analysis.create = vi.fn(async (data) => {
    const id = generateId();
    const newAnalysis = {
      _id: new mongoose.Types.ObjectId(id),
      ...data,
      createdAt: new Date(),
    };
    mockDB.analyses.set(id, newAnalysis);
    return newAnalysis;
  });

  Analysis.findById = vi.fn(async (id) => {
    return mockDB.analyses.get(id?.toString()) || null;
  });

  Analysis.find = vi.fn((filter) => {
    let results = Array.from(mockDB.analyses.values());
    if (filter?.caseId) {
      results = results.filter(a => a.caseId?.toString() === filter.caseId.toString());
    }
    return {
      sort: () => ({
        lean: async () => results,
      }),
    };
  });

  Analysis.deleteMany = vi.fn(async (filter) => {
    if (filter?.caseId) {
      for (const [id, a] of mockDB.analyses.entries()) {
        if (a.caseId?.toString() === filter.caseId.toString()) {
          mockDB.analyses.delete(id);
        }
      }
    }
    return { acknowledged: true };
  });

  // --- Mock ChatMessage Methods ---
  ChatMessage.create = vi.fn(async (data) => {
    const id = generateId();
    const newMsg = {
      _id: new mongoose.Types.ObjectId(id),
      ...data,
      createdAt: new Date(),
    };
    mockDB.chatMessages.set(id, newMsg);
    return newMsg;
  });

  ChatMessage.find = vi.fn((filter) => {
    let results = Array.from(mockDB.chatMessages.values());
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
  });

  ChatMessage.deleteMany = vi.fn(async (filter) => {
    if (filter?.caseId) {
      for (const [id, m] of mockDB.chatMessages.entries()) {
        if (m.caseId?.toString() === filter.caseId.toString()) {
          mockDB.chatMessages.delete(id);
        }
      }
    }
    return { acknowledged: true };
  });
});

beforeEach(() => {
  mockDB.users.clear();
  mockDB.cases.clear();
  mockDB.analyses.clear();
  mockDB.chatMessages.clear();
});
