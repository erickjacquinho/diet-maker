import { describe, expect, it } from 'vitest';
import {
  parseAssessmentDto,
  parseAssessmentInput,
  parseCreateAssessmentRequest,
  parseFollowUpDto,
  parseFollowUpInput,
} from '../../src/lib/contracts/clinical';

const id = '3f2b8a52-7f0e-4c43-9a55-0c1d5e2b9a10';

describe('clinical contracts', () => {
  it('rejects server-owned fields on assessments (mass assignment)', () => {
    for (const field of ['accountId', 'patientId', 'version', 'bodyFatPercent', 'createdAt', 'calculationMethod']) {
      expect(() => parseAssessmentInput({ weightKg: 70, [field]: 1 })).toThrow('Unknown field');
    }
  });

  it('requires a UUID and rejects non-numeric measurements', () => {
    expect(() => parseCreateAssessmentRequest({ id: 'x', assessment: {} })).toThrow('Invalid id');
    expect(() => parseCreateAssessmentRequest({ id, assessment: { weightKg: '70' } })).toThrow('Invalid number');
    expect(parseCreateAssessmentRequest({ id: id.toUpperCase(), assessment: { weightKg: 70 } }).id).toBe(id);
  });

  it('accepts only known follow-up types and fields', () => {
    expect(() => parseFollowUpInput({ followUp: { accountId: 'a' } })).toThrow('Unknown field');
    expect(() => parseFollowUpInput({ followUp: { type: 'OTHER', dueDate: '2026-01-01' } })).toThrow('Invalid type');
    expect(() => parseFollowUpInput({ followUp: { dueDates: { OTHER: '2026-01-01' } } })).toThrow('Unknown field');
    expect(parseFollowUpInput({ followUp: { dueDate: '2026-01-01', type: 'DIET_UPDATE' } }).type).toEqual(['DIET_UPDATE']);
  });

  it('output allowlist drops everything not in the DTO', () => {
    const dto = parseAssessmentDto({
      id, patientId: id, clinicalDate: '2026-01-01', assessmentType: 'complete', weightKg: '70', autoFilledFields: [],
      calculationMethod: 'US_NAVY', calculationVersion: 'v', calculationInputSnapshot: {}, version: 1,
      createdAt: 'a', updatedAt: 'b', accountId: 'secret', internal: 'x',
    });
    expect(dto).not.toHaveProperty('accountId');
    expect(dto).not.toHaveProperty('internal');
    const followUp = parseFollowUpDto({ patientId: id, dueDate: '2026-01-01', dueDates: { DIET_UPDATE: '2026-01-01' }, comments: 'c', version: 1, createdAt: 'a', updatedAt: 'b', accountId: 's' });
    expect(followUp).not.toHaveProperty('accountId');
    expect(followUp.type).toEqual(['DIET_UPDATE']);
  });
});
