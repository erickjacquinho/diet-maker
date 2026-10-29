import 'server-only';

import { parseProfessionalProfile, type ProfessionalProfile } from '@/lib/domain/professional-profile';
import { getProfessionalProfile, updateProfessionalProfile } from './online-db/repository';
import { decryptProfessionalProfile, encryptProfessionalProfile } from './save-keys';

/** Reads and decrypts the owner's profile; null when signup has not completed it yet. */
export async function readProfessionalProfile(ownerId: string): Promise<ProfessionalProfile | null> {
  const record = await getProfessionalProfile(ownerId);
  if (!record) return null;
  const stored = decryptProfessionalProfile(ownerId, {
    ciphertext: record.profileCipher,
    iv: record.profileIv,
    kekId: record.profileKekId,
  });
  return parseProfessionalProfile(stored);
}

/** Re-encrypts the whole profile; returns false when the owner has no profile row to update. */
export async function writeProfessionalProfile(ownerId: string, profile: ProfessionalProfile): Promise<boolean> {
  const encrypted = encryptProfessionalProfile(ownerId, parseProfessionalProfile(profile));
  return updateProfessionalProfile({
    ownerId,
    profileCipher: encrypted.ciphertext,
    profileIv: encrypted.iv,
    profileKekId: encrypted.kekId,
  });
}
