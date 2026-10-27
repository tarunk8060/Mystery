import { GoogleGenAI } from '@google/genai';
import { config, validateConfig } from '../src/config/env.js';
import { analyzeCase, answerCaseQuestion } from '../src/services/geminiService.js';

async function runLiveTest() {
  console.log('--- AI Mystery Room: Live Gemini Integration Test ---');
  validateConfig();

  if (!config.geminiApiKey) {
    console.warn('GEMINI_API_KEY is not configured. Please set it in your .env to run live tests.');
    process.exit(0);
  }

  console.log(`Connecting to Gemini API using model: ${config.geminiModel}...`);

  const mockCase = {
    title: 'The Stolen Clockwork Bird',
    category: 'Theft',
    description: 'A priceless mechanical clockwork nightingale was stolen from the gallery between 8:00 PM and 9:00 PM during a sudden electrical blackout.',
    incidentDate: '1888-11-05',
    location: 'Kensington Clockwork Museum',
    investigationObjective: 'Identify who stole the clockwork nightingale and uncover contradictions in alibis.',
    suspects: [
      {
        name: 'Victor Vance',
        description: 'Lead mechanical curator with keys to the display case.',
        statement: 'I was in the basement repair shop all evening until the lights went out.',
        alibi: 'The night watchman can testify seeing me come up from the basement at 9:15 PM.',
        backgroundInformation: 'Deep in debt to a London clock syndicate.',
      },
      {
        name: 'Julian Croft',
        description: 'Wealthy private collector present as an honored guest.',
        statement: 'I never left the main banquet hall until the blackout was resolved.',
        alibi: 'Several guests sat at my table.',
        backgroundInformation: 'Previously offered 5,000 pounds for the nightingale, which was rejected.',
      },
    ],
    clues: [
      {
        clueCode: 'CLUE-1',
        description: 'A pocket watch with broken glass found near the display pedestal, stopped at 8:22 PM.',
        type: 'Physical evidence',
        source: 'Display pedestal carpet',
        verificationStatus: 'Corroborated',
      },
      {
        clueCode: 'CLUE-2',
        description: 'Basement electrical circuit breaker was manually switched off, not tripped by overload.',
        type: 'Physical evidence',
        source: 'Breaker box',
        verificationStatus: 'Corroborated',
      },
      {
        clueCode: 'CLUE-3',
        description: 'Guest statement confirming Julian Croft excused himself for fresh air at 8:15 PM.',
        type: 'Witness statement',
        source: 'Interview with Lady Pemberton',
        verificationStatus: 'Corroborated',
      },
    ],
  };

  try {
    console.log('Sending case payload to Gemini for structured forensic deduction...');
    const startTime = Date.now();
    const result = await analyzeCase(mockCase);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\nAnalysis completed in ${duration}s!`);
    console.log('----------------------------------------------------');
    console.log(`Conclusion Status: [${result.conclusion.status}] (Confidence: ${result.conclusion.confidence})`);
    console.log(`Primary Culprit / Cause: ${result.conclusion.primaryCulpritOrCause}`);
    console.log(`Hypothesis: ${result.conclusion.hypothesis}`);
    console.log(`Summary: ${result.summary}`);
    console.log(`Supporting Evidence Cited: ${result.supportingEvidence.map(e => e.clueCode).join(', ')}`);
    console.log(`Contradictions Found: ${result.contradictions.length}`);
    result.contradictions.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c.description} (Clues: ${c.conflictingClueCodes.join(', ')})`);
    });
    console.log(`Missing Information: ${result.missingInformation.length} points`);
    console.log('----------------------------------------------------');

    console.log('\nTesting Detective Interrogation Chat...');
    const question = 'Which suspect’s statement is contradicted by CLUE-3?';
    console.log(`User asks: "${question}"`);
    const chatReply = await answerCaseQuestion(mockCase, [], question);
    console.log(`Detective reply:\n${chatReply}`);
    console.log('----------------------------------------------------');
    console.log('LIVE GEMINI INTEGRATION TEST PASSED!');
  } catch (error) {
    console.error('Live Gemini test failed:', error);
    process.exit(1);
  }
}

runLiveTest();
