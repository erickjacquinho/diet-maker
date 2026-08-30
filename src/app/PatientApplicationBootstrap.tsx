'use client';

import { useEffect } from 'react';
import { getBrowserPatientRuntime } from '@/lib/application/browser-composition';

export function PatientApplicationBootstrap() {
  useEffect(() => {
    void getBrowserPatientRuntime().catch(() => undefined);
  }, []);

  return null;
}
