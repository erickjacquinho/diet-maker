'use client';

import { Button } from '@/components/atoms';

export default function DashboardPage() {
  return (
    <section className="mx-auto flex w-full max-w-screen-xl flex-col items-start gap-4 p-8" data-route="dashboard">
      <h1 className="text-style-page-title font-bold text-text-primary">Início</h1>
      <p className="text-style-body text-text-secondary">Gerencie seus arquivos locais e backups em Configurações → Saves.</p>
      <Button type="button" onClick={() => window.dispatchEvent(new Event('nutridiet:open-saves'))}>
        Abrir configurações de saves
      </Button>
    </section>
  );
}
