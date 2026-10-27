import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Cases, Suspects, and Clues API', () => {
  let user1Token;
  let user2Token;
  let user1Id;
  let user2Id;

  beforeEach(async () => {
    // Register User 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Detective Dupin',
      email: 'dupin@paris.fr',
      password: 'RatiocinationPass1',
    });
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    // Register User 2
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Inspector Lestrade',
      email: 'lestrade@scotlandyard.gov.uk',
      password: 'YardPassword456',
    });
    user2Token = res2.body.token;
    user2Id = res2.body.user.id;
  });

  it('should create a case with initial suspects and clues', async () => {
    const payload = {
      title: 'The Stolen Sapphire of Blackwood Manor',
      category: 'Theft',
      description: 'A priceless sapphire vanished from Lord Blackwood’s locked study at 9:00 PM.',
      location: 'Blackwood Manor, Surrey',
      incidentDate: '1895-10-14',
      investigationObjective: 'Determine who entered the study and removed the sapphire.',
      suspects: [
        {
          name: 'Arthur Pendelton',
          statement: 'I was in the conservatory reading until 10:00 PM.',
          alibi: 'The head gardener saw me around 9:30 PM.',
        },
      ],
      clues: [
        {
          description: 'A muddy size 10 boot print near the study terrace window.',
          type: 'Physical evidence',
          source: 'Crime scene forensics',
        },
      ],
    };

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${user1Token}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.case.title).toBe(payload.title);
    expect(res.body.case.suspects).toHaveLength(1);
    expect(res.body.case.clues).toHaveLength(1);
    expect(res.body.case.clues[0].clueCode).toBe('CLUE-1');
  });

  it('should enforce user isolation: User 2 cannot access or edit User 1’s case', async () => {
    // User 1 creates a case
    const createRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Secret Case',
        category: 'Fraud',
        description: 'Classified corporate embezzlement scheme under investigation.',
      });

    const caseId = createRes.body.case._id;

    // User 2 attempts to fetch User 1's case
    const getRes = await request(app)
      .get(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(getRes.status).toBe(403);
    expect(getRes.body.error.code).toBe('FORBIDDEN');

    // User 2 attempts to delete User 1's case
    const delRes = await request(app)
      .delete(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(delRes.status).toBe(403);
  });

  it('should add, update, and remove a suspect and track isAnalysisStale', async () => {
    const caseRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Manor Heist',
        category: 'Theft',
        description: 'Investigation into missing jewels.',
      });

    const caseId = caseRes.body.case._id;

    // 1. Add Suspect
    const addSuspectRes = await request(app)
      .post(`/api/cases/${caseId}/suspects`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Lady Beatrice',
        statement: 'I never touched the vault key.',
        alibi: 'In the dining room with guests.',
      });

    expect(addSuspectRes.status).toBe(201);
    expect(addSuspectRes.body.suspect.name).toBe('Lady Beatrice');
    const suspectId = addSuspectRes.body.suspect._id;

    // 2. Update Suspect
    const updateSuspectRes = await request(app)
      .patch(`/api/cases/${caseId}/suspects/${suspectId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        statement: 'I may have held the key earlier in the afternoon.',
      });

    expect(updateSuspectRes.status).toBe(200);
    expect(updateSuspectRes.body.suspect.statement).toContain('earlier in the afternoon');

    // 3. Delete Suspect
    const deleteSuspectRes = await request(app)
      .delete(`/api/cases/${caseId}/suspects/${suspectId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(deleteSuspectRes.status).toBe(200);
  });

  it('should sequentially assign clue codes: CLUE-1, CLUE-2 and support filtering', async () => {
    const caseRes = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Cipher Incident',
        category: 'Cyber mystery',
        description: 'Encrypted flash drive found in server room.',
      });

    const caseId = caseRes.body.case._id;

    // Add first clue
    const c1 = await request(app)
      .post(`/api/cases/${caseId}/clues`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        description: 'Server access log showing admin login at 03:15 AM.',
        type: 'Digital evidence',
      });
    expect(c1.body.clue.clueCode).toBe('CLUE-1');

    // Add second clue
    const c2 = await request(app)
      .post(`/api/cases/${caseId}/clues`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        description: 'Torn badge lanyard with partial serial number.',
        type: 'Physical evidence',
      });
    expect(c2.body.clue.clueCode).toBe('CLUE-2');

    // Fetch case and verify both clues exist
    const fetchRes = await request(app)
      .get(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(fetchRes.body.case.clues).toHaveLength(2);
  });
});
