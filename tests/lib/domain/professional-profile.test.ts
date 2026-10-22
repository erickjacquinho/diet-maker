// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_LOGO_MAX_BYTES,
  parseDocumentLogo,
  getProfessionalSignature,
  getProfessionalTitle,
  parseProfessionalProfile,
} from '@/lib/domain/professional-profile';
import { clinicLogo } from '../../fixtures/clinic-logo';

const signupProfile = {
  firstName: 'Ana',
  lastName: 'Souza',
  averagePatientsPerMonth: 40,
  experience: { kind: 'years', value: 5 },
};

describe('professional profile', () => {
  it('reads a profile written at signup with defaults for every later field', () => {
    expect(parseProfessionalProfile(signupProfile)).toEqual({
      ...signupProfile,
      professionalTitle: null,
      crn: null,
      specialties: null,
      bio: null,
      contactEmail: null,
      phone: null,
      instagram: null,
      website: null,
      clinicName: null,
      city: null,
      state: null,
      serviceMode: null,
      showOnDocuments: true,
      agendaRemindersEnabled: true,
      documentLogo: null,
    });
  });

  it('normalizes optional contact and presentation fields', () => {
    const profile = parseProfessionalProfile({
      ...signupProfile,
      firstName: '  Ana   Maria ',
      professionalTitle: ' Nutricionista   esportiva ',
      crn: ' CRN-3  12345 ',
      bio: '  Primeira linha  \r\n\r\n\r\n  Segunda   linha ',
      contactEmail: ' Contato@Clinica.COM ',
      instagram: '@ana.nutri',
      website: 'anasouza.com.br',
      city: '   ',
      state: 'SP',
      serviceMode: 'hybrid',
      showOnDocuments: false,
    });

    expect(profile).toMatchObject({
      firstName: 'Ana Maria',
      professionalTitle: 'Nutricionista esportiva',
      crn: 'CRN-3 12345',
      bio: 'Primeira linha\n\nSegunda linha',
      contactEmail: 'contato@clinica.com',
      instagram: '@ana.nutri',
      website: 'https://anasouza.com.br',
      city: null,
      state: 'SP',
      serviceMode: 'hybrid',
      showOnDocuments: false,
    });
  });

  it.each([
    ['unknown field', { ...signupProfile, role: 'admin' }],
    ['empty name', { ...signupProfile, firstName: '  ' }],
    ['negative patients', { ...signupProfile, averagePatientsPerMonth: -1 }],
    ['invalid experience', { ...signupProfile, experience: { kind: 'decades' } }],
    ['invalid email', { ...signupProfile, contactEmail: 'ana@' }],
    ['invalid instagram', { ...signupProfile, instagram: 'ana souza' }],
    ['script website', { ...signupProfile, website: 'javascript:alert(1)' }],
    ['unknown state', { ...signupProfile, state: 'XX' }],
    ['long bio', { ...signupProfile, bio: 'a'.repeat(601) }],
  ])('rejects %s', (_label, value) => {
    expect(() => parseProfessionalProfile(value)).toThrow(TypeError);
  });

  it('builds the document signature from name, title and CRN', () => {
    const profile = parseProfessionalProfile({ ...signupProfile, crn: 'CRN-3 12345' });

    expect(getProfessionalTitle(profile)).toBe('Nutricionista');
    expect(getProfessionalSignature(profile)).toBe('Ana Souza · Nutricionista · CRN-3 12345');
  });

  it('preserves the reminder preference and PNG logo when parsing a saved profile', () => {
    expect(parseProfessionalProfile({ ...signupProfile, agendaRemindersEnabled: false, documentLogo: clinicLogo }))
      .toMatchObject({ agendaRemindersEnabled: false, documentLogo: clinicLogo });
    expect(() => parseProfessionalProfile({ ...signupProfile, agendaRemindersEnabled: 'false' })).toThrow(TypeError);
  });

  it('bounds logo content, dimensions and format at the trust boundary', () => {
    const largeDimensions = Buffer.from(clinicLogo.slice(22), 'base64');
    largeDimensions.writeUInt32BE(1025, 16);
    const oversized = Buffer.alloc(DOCUMENT_LOGO_MAX_BYTES + 1);
    Buffer.from(clinicLogo.slice(22), 'base64').copy(oversized);
    for (const value of [
      'https://example.invalid/logo.png',
      'data:image/svg+xml;base64,PHN2Zz4=',
      'data:image/png;base64,SGVsbG8=',
      `data:image/png;base64,${largeDimensions.toString('base64')}`,
      `data:image/png;base64,${oversized.toString('base64')}`,
    ]) expect(() => parseDocumentLogo(value)).toThrow(TypeError);
  });

  it('accepts the byte limit without rejecting a bounded PNG payload', () => {
    const maximum = Buffer.alloc(DOCUMENT_LOGO_MAX_BYTES);
    Buffer.from(clinicLogo.slice(22), 'base64').copy(maximum);
    const value = `data:image/png;base64,${maximum.toString('base64')}`;
    expect(parseDocumentLogo(value)).toBe(value);
  });
});
