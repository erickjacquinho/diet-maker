'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SecondaryActionButton } from '@/components/atoms';
import { DEFAULT_OBJECTIVES, type Patient } from '@/lib/patientsStore';
import { formatWhatsappContact } from '@/lib/whatsapp';

export interface EditPatientModalProps {
  open: boolean;
  patient: Patient | null;
  objectives: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (patient: Patient) => void;
  onRequestAddObjective: () => void;
  objectiveToApply?: string;
}

export function EditPatientModal({ open, patient, objectives, onOpenChange, onSave, onRequestAddObjective, objectiveToApply }: EditPatientModalProps) {
  const [draft, setDraft] = useState<Patient | null>(patient);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  useEffect(() => {
    if (open && patient) setDraft({ ...patient, whatsapp: formatWhatsappContact(patient.whatsapp) || undefined });
  }, [open, patient]);

  useEffect(() => {
    if (objectiveToApply && draft) setDraft((current) => current ? { ...current, objective: objectiveToApply } : current);
  }, [objectiveToApply]);

  const hasUnsavedChanges = Boolean(draft && patient && (
    draft.name !== patient.name || draft.age !== patient.age || draft.heightCm !== patient.heightCm || draft.weightKg !== patient.weightKg ||
    (draft.gender || 'Masculino') !== (patient.gender || 'Masculino') || (draft.objective || '') !== (patient.objective || '') ||
    formatWhatsappContact(draft.whatsapp) !== formatWhatsappContact(patient.whatsapp) || draft.targetKcal !== patient.targetKcal ||
    draft.targetProtein !== patient.targetProtein || draft.targetCarbs !== patient.targetCarbs || draft.targetFats !== patient.targetFats
  ));

  const requestClose = (nextOpen: boolean) => {
    if (!nextOpen && hasUnsavedChanges) { setIsDiscardConfirmOpen(true); return; }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || !draft.name.trim()) return;
    onSave({ ...draft, name: draft.name.trim(), whatsapp: formatWhatsappContact(draft.whatsapp) || undefined });
    onOpenChange(false);
  };

  const confirmDiscard = () => {
    setDraft(patient ? { ...patient } : null);
    setIsDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent className="max-h-screen overflow-y-auto" onPointerDownOutside={(event) => { if (hasUnsavedChanges) { event.preventDefault(); setIsDiscardConfirmOpen(true); } }} onEscapeKeyDown={(event) => { if (hasUnsavedChanges) { event.preventDefault(); setIsDiscardConfirmOpen(true); } }}>
          <DialogHeader className="border-b border-border-subtle pb-3"><DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2"><Pencil size={18} className="text-success" /><span>Editar Dados do Paciente</span></DialogTitle><DialogDescription>Altere as informações cadastrais e metas do paciente.</DialogDescription></DialogHeader>
          {draft && <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div><label htmlFor="edit-patient-name" className="text-style-legal font-bold text-text-primary block mb-1">Nome Completo do Paciente</label><Input id="edit-patient-name" required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
            <div><label htmlFor="edit-patient-whatsapp" className="text-style-legal font-bold text-text-primary block mb-1">WhatsApp</label><Input id="edit-patient-whatsapp" type="tel" inputMode="numeric" autoComplete="tel" value={draft.whatsapp ?? ''} onChange={(event) => setDraft({ ...draft, whatsapp: formatWhatsappContact(event.target.value) })} placeholder="(11) 99999-9999" /></div>
            <div className="grid grid-cols-3 gap-2"><div><label className="text-style-legal font-semibold text-text-muted block mb-1">Idade</label><Input type="number" value={draft.age} onChange={(event) => setDraft({ ...draft, age: Number(event.target.value) })} /></div><div><label className="text-style-legal font-semibold text-text-muted block mb-1">Altura (cm)</label><Input type="number" value={draft.heightCm} onChange={(event) => setDraft({ ...draft, heightCm: Number(event.target.value) })} /></div><div><label className="text-style-legal font-semibold text-text-muted block mb-1">Gênero</label><Select value={draft.gender || 'Masculino'} onValueChange={(value) => setDraft({ ...draft, gender: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent layer="modal"><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem>{draft.gender && !['Masculino', 'Feminino'].includes(draft.gender) && <SelectItem value={draft.gender}>{draft.gender}</SelectItem>}</SelectContent></Select></div></div>
            <div><label htmlFor="edit-patient-objective" className="text-style-legal font-bold text-text-primary block mb-1">Objetivo Clínico / Esportivo</label><div className="flex items-center gap-2"><div className="flex-1 min-w-0"><Select value={draft.objective || ''} onValueChange={(value) => setDraft({ ...draft, objective: value })}><SelectTrigger id="edit-patient-objective"><SelectValue placeholder="Selecione o objetivo" /></SelectTrigger><SelectContent layer="modal">{Array.from(new Set([...DEFAULT_OBJECTIVES, ...objectives, draft.objective].filter(Boolean))).map((objective) => <SelectItem key={objective} value={objective}>{objective}</SelectItem>)}</SelectContent></Select></div><SecondaryActionButton type="button" onClick={onRequestAddObjective} icon={<Plus size={14} className="text-success" />} title="Adicionar Novo Objetivo">Novo</SecondaryActionButton></div></div>
            <div className="flex gap-2 pt-2"><Button type="button" variant="secondary" size="compact" onClick={() => requestClose(false)} className="flex-1">Cancelar</Button><Button type="submit" variant="primary" size="compact" className="flex-1">Salvar Alterações</Button></div>
          </form>}
        </DialogContent>
      </Dialog>
      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle className="font-bold text-style-body text-text-primary flex items-center gap-2"><AlertTriangle size={18} className="text-warning" />Descartar alterações?</DialogTitle><DialogDescription>Você possui alterações não salvas nos dados do paciente. Deseja descartar as alterações e sair?</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="secondary" size="compact" onClick={() => setIsDiscardConfirmOpen(false)}>Não</Button><Button type="button" variant="destructive" size="compact" onClick={confirmDiscard}>Sim, descartar</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}
