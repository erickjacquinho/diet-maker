import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/atoms';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';
import type { WhatsAppDietExportOptions } from '@/lib/whatsapp';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsAppText: string;
  whatsAppOptions: WhatsAppDietExportOptions;
  onOptionsChange: (options: WhatsAppDietExportOptions) => void;
  variations: { id: string; name: string }[];
}

export function WhatsAppShareModal({ isOpen, onClose, whatsAppText, whatsAppOptions, onOptionsChange, variations }: WhatsAppShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsAppText);
    setCopied(true);
    toast.success('Texto copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(whatsAppText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  useSaveShortcut({
    onSave: handleSendWhatsApp,
    enabled: isOpen,
    priority: 10,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-primary">
            <MessageCircle className="w-5 h-5 text-success" />
            Enviar Dieta via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Revise o texto formatado antes de enviar ao paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {variations.length > 0 && (
            <div className="flex flex-col gap-2">
              <span id="whatsapp-variation-label" className="text-style-body-small font-semibold text-text-primary">Variações do ciclo:</span>
              <ToggleGroup
                type="multiple"
                value={whatsAppOptions.selectedVariationIds}
                onValueChange={(value: string[]) => onOptionsChange({ ...whatsAppOptions, selectedVariationIds: value })}
                aria-labelledby="whatsapp-variation-label"
                className="flex flex-wrap items-center justify-start gap-2 rounded-none border-0 bg-transparent p-0"
              >
                {variations.map((variation) => (
                  <ToggleGroupItem
                    key={variation.id}
                    value={variation.id}
                    className="min-h-14 justify-between whitespace-normal rounded-control border border-border-subtle bg-surface px-3 py-2 text-left text-style-body font-medium data-[state=on]:border-primary data-[state=on]:bg-primary-soft data-[state=on]:text-primary"
                  >
                    <span>{variation.name}</span>
                    {whatsAppOptions.selectedVariationIds.includes(variation.id) && <Check size={16} className="shrink-0" aria-hidden="true" />}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
          <div className="flex items-center gap-4">
            <span id="whatsapp-inclusion-label" className="text-style-body-small font-semibold text-text-primary">Incluir:</span>
            <ToggleGroup
              type="multiple"
              value={[
                ...(whatsAppOptions.includeNutrition ? ['nutrition'] : []),
                ...(whatsAppOptions.includeMealTimes ? ['meal-times'] : []),
              ]}
              onValueChange={(value: string[]) => onOptionsChange({
                includeNutrition: value.includes('nutrition'),
                includeMealTimes: value.includes('meal-times'),
                selectedVariationIds: whatsAppOptions.selectedVariationIds,
              })}
              aria-labelledby="whatsapp-inclusion-label"
              className="flex items-center gap-2 rounded-none border-0 bg-transparent p-0"
            >
              <ToggleGroupItem
                value="nutrition"
                className="min-h-14 justify-between whitespace-normal rounded-control border border-border-subtle bg-surface px-3 py-2 text-left text-style-body font-medium data-[state=on]:border-primary data-[state=on]:bg-primary-soft data-[state=on]:text-primary"
              >
                <span>Macros e calorias</span>
                {whatsAppOptions.includeNutrition && <Check size={16} className="shrink-0" aria-hidden="true" />}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="meal-times"
                className="min-h-14 justify-between whitespace-normal rounded-control border border-border-subtle bg-surface px-3 py-2 text-left text-style-body font-medium data-[state=on]:border-primary data-[state=on]:bg-primary-soft data-[state=on]:text-primary"
              >
                <span>Horário das refeições</span>
                {whatsAppOptions.includeMealTimes && <Check size={16} className="shrink-0" aria-hidden="true" />}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Textarea
            readOnly
            state="read-only"
            value={whatsAppText}
            className="w-full h-64 p-3 font-mono text-style-body-small border-border-subtle resize-none"
          />
        </div>

        <DialogFooter className="flex items-center justify-between w-full">
          <Button variant="secondary" size="compact" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1 text-success" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copiado' : 'Copiar Texto'}
          </Button>
          <div className="flex gap-2">
            <Button variant="quiet" onClick={onClose}>
              Fechar
            </Button>
            <Button
              variant="primary"
              onClick={handleSendWhatsApp}
              aria-keyshortcuts="Control+s Meta+s"
              title="Abrir WhatsApp (Ctrl+S)"
            >
              Abrir WhatsApp <span className="opacity-subdued text-style-chart-micro font-mono">(Ctrl+S)</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
