// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  getProfessionalSignature,
  getProfessionalTitle,
  parseProfessionalProfile,
} from '@/lib/domain/professional-profile';

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
});
