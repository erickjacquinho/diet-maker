import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsAppText: string;
}

export function WhatsAppShareModal({ isOpen, onClose, whatsAppText }: WhatsAppShareModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            Enviar Dieta via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Revise o texto formatado antes de enviar ao paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <textarea
            readOnly
            value={whatsAppText}
            className="w-full h-64 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none"
          />
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button variant="secondary" size="compact" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copiado' : 'Copiar Texto'}
          </Button>
          <div className="flex gap-2">
            <Button variant="quiet" onClick={onClose}>
              Fechar
            </Button>
            <Button variant="primary" onClick={handleSendWhatsApp}>
              Abrir WhatsApp
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
