import 'server-only';

import { normalizePatientInput, validatePatientInput, type PatientInput } from '@/lib/domain/patient';
import {
  parseCreatePatientRequest,
  parsePatientDto,
  parsePatientPageDto,
  parsePatientSearchRequest,
  parsePatientUpdateRequest,
} from '@/lib/contracts/patients';
import { defineEndpoint, type EndpointContext } from '../api/define-endpoint';
import { ApiError, NotFoundError } from '../api/api-errors';
import { accountKeys } from '../crypto/account-keys';
import { createServerPatientRepository } from './patient-repository';

const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function repository(context: EndpointContext<unknown>) {
  return createServerPatientRepository(context.tx, accountKeys.createSealer(context.tx, context.account.id), context.account.id);
}

function patientId(context: EndpointContext<unknown>): string {
  const id = context.params.id;
  if (!id || !uuidPattern.test(id)) throw new NotFoundError();
  return id.toLowerCase();
}

function validated(input: PatientInput, requireProfileFields: boolean): PatientInput {
  const normalized = normalizePatientInput(input);
  if (!validatePatientInput(normalized, { requireProfileFields }).valid) throw new ApiError(400, 'INVALID_REQUEST');
  return normalized;
}

export const createPatientEndpoint = defineEndpoint({
  input: { parse: parseCreatePatientRequest },
  output: { parse: parsePatientDto },
  rateLimit: 'mutation',
  async handler(context) {
    const { id, patient } = context.input;
    const { patient: stored } = await repository(context).create(id, validated(patient, true));
    return stored;
  },
});

export const searchPatientsEndpoint = defineEndpoint({
  input: { parse: parsePatientSearchRequest },
  output: { parse: parsePatientPageDto },
  rateLimit: 'read',
  handler: (context) => repository(context).searchActive(context.input.query, context.input.pageIndex, context.input.pageSize),
});

export const getPatientEndpoint = defineEndpoint({
  output: { parse: parsePatientDto },
  rateLimit: 'read',
  async handler(context) {
    const patient = await repository(context).getById(patientId(context));
    if (!patient) throw new NotFoundError();
    return patient;
  },
});

export const updatePatientEndpoint = defineEndpoint({
  input: { parse: parsePatientUpdateRequest },
  output: { parse: parsePatientDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).update(patientId(context), context.version as number, validated(context.input, true)),
});

export const archivePatientEndpoint = defineEndpoint({
  output: { parse: parsePatientDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).archive(patientId(context), context.version as number),
});

export const restorePatientEndpoint = defineEndpoint({
  output: { parse: parsePatientDto },
  requireVersion: true,
  rateLimit: 'mutation',
  handler: (context) => repository(context).restore(patientId(context), context.version as number),
});
