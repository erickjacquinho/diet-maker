'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { ReadyDiet } from '@/lib/domain/library/library-model';
import { getBrowserLibraryApplication } from '@/lib/application/browser-composition';
import { toast } from 'sonner';

export default function PresetsPage() {
  const [readyDiets, setReadyDiets] = useState<ReadyDiet[]>([]);
  const [isLoadingReadyDiets, setIsLoadingReadyDiets] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;
    void getBrowserLibraryApplication().then((application) => application.listReadyDiets()).then((items) => {
      if (!cancelled) setReadyDiets(items);
    }).catch(() => {
      if (!cancelled) toast.error('Não foi possível carregar as dietas prontas salvas.');
    }).finally(() => {
      if (!cancelled) setIsLoadingReadyDiets(false);
    });
    return () => { cancelled = true; };
  }, []);

  const filteredReadyDiets = readyDiets.filter((diet) => diet.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="py-6 px-8 max-w-container-workflow mx-auto flex flex-col gap-6 w-full">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-success" />
            <h1 className="font-bold text-style-section-title text-text-primary tracking-tight">Dietas prontas</h1>
          </div>
          <p className="text-style-legal text-text-muted mt-1 font-medium">
            Protocolos completos salvos a partir do editor de dieta, prontos para reaproveitar em pacientes.
          </p>
        </div>
      </div>

      {readyDiets.length > 0 && (
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar dieta pronta por nome..."
            className="pl-11 pr-4"
          />
        </div>
      )}

      {isLoadingReadyDiets && <p role="status" className="text-style-legal text-text-muted">Carregando dietas prontas…</p>}

      {filteredReadyDiets.length > 0 && (
        <section aria-labelledby="ready-diets-title" className="flex flex-col gap-4">
          <div>
            <h2 id="ready-diets-title" className="text-style-section-title font-bold text-text-primary">Dietas prontas</h2>
            <p className="text-style-legal text-text-muted">Composições salvas no editor, com os horários das refeições.</p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {filteredReadyDiets.map((diet) => {
              const firstVariation = diet.document.variations[0];
              const mealCount = Math.max(0, ...diet.document.variations.map((variation) => variation.meals.length));
              return (
                <Card key={diet.id} className="bg-surface border-border-subtle rounded-surface p-5">
                  <CardContent className="p-0 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-style-legal font-semibold text-text-muted">
                        {diet.document.mode === 'CARB_CYCLING' ? `${diet.document.variations.length} variações` : 'Dieta simples'}
                      </span>
                      <span className="text-style-legal text-text-muted">{mealCount} refeições</span>
                    </div>
                    <h3 className="text-style-body-small font-bold text-text-primary">{diet.name}</h3>
                    {firstVariation && (
                      <ul className="flex flex-col gap-1 border-t border-border-subtle pt-3 text-style-legal text-text-secondary">
                        {firstVariation.meals.slice(0, 5).map((meal) => (
                          <li key={meal.id} className="flex items-center justify-between gap-3">
                            <span className="truncate">{meal.name}</span>
                            <span className="shrink-0">{meal.time || 'Sem horário'}</span>
                          </li>
                        ))}
                        {firstVariation.meals.length > 5 && <li className="text-text-muted">+{firstVariation.meals.length - 5} refeições</li>}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {filteredReadyDiets.length === 0 && !isLoadingReadyDiets && (
        <Card className="bg-surface border-border-subtle rounded-surface p-12 text-center max-w-md mx-auto flex flex-col gap-4 my-8">
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-surface bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-style-body text-text-primary">Nenhuma dieta pronta</h3>
              <p className="text-style-legal text-text-muted mt-1 leading-relaxed">
                Salve uma dieta como pronta no editor de dieta de um paciente e ela aparecerá aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
