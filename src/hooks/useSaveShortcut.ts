import { useEffect, useRef } from 'react';

export interface UseSaveShortcutOptions {
  /**
   * Função executada ao disparar o atalho Ctrl+S / Cmd+S.
   */
  onSave?: () => void | Promise<void>;
  /**
   * Referência opcional para um formulário HTML a ser submetido via requestSubmit().
   */
  formRef?: React.RefObject<HTMLFormElement | null>;
  /**
   * Elemento alvo opcional para escuta local (se omitido, escuta no window).
   */
  targetRef?: React.RefObject<HTMLElement | null>;
  /**
   * Se o listener de atalho está ativo (ex.: repassar `open` de um modal). Padrão: true.
   */
  enabled?: boolean;
  /**
   * Se deve chamar event.preventDefault() para evitar o diálogo nativo do navegador. Padrão: true.
   */
  preventDefault?: boolean;
  /**
   * Se deve interromper a propagação do evento para camadas inferiores/mãe. Padrão: true.
   */
  stopPropagation?: boolean;
  /**
   * Prioridade opcional (número maior = prioridade maior em caso de múltiplos listeners).
   * Modais costumam usar prioridade 10 ou mais sobre a página (prioridade 0).
   */
  priority?: number;
}

// Registro global de handlers ativos ordenados por prioridade e tempo de montagem
interface ActiveHandler {
  id: symbol;
  priority: number;
  handleSave: (event: KeyboardEvent) => void;
  stopPropagation: boolean;
  preventDefault: boolean;
}

const activeHandlers: ActiveHandler[] = [];

if (typeof window !== 'undefined') {
  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      const isSKey = event.key?.toLowerCase() === 's' || event.code === 'KeyS';
      const isShortcut = (event.ctrlKey || event.metaKey) && isSKey;

      if (!isShortcut) return;

      if (activeHandlers.length === 0) return;

      // Executa o handler de maior prioridade (último do array ordenado)
      const topHandler = activeHandlers[activeHandlers.length - 1];
      if (topHandler) {
        if (topHandler.preventDefault) {
          event.preventDefault();
        }
        if (topHandler.stopPropagation) {
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
        topHandler.handleSave(event);
      }
    },
    { capture: true }
  );
}

/**
 * Hook centralizado para gerenciar atalhos de teclado Ctrl+S (Windows/Linux) e Cmd+S (macOS).
 * Garante que modais e formulários ativos tenham precedência sobre a tela mãe.
 */
export function useSaveShortcut({
  onSave,
  formRef,
  enabled = true,
  preventDefault = true,
  stopPropagation = true,
  priority = 0,
}: UseSaveShortcutOptions) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const formRefInternal = useRef(formRef);
  formRefInternal.current = formRef;

  useEffect(() => {
    if (!enabled) return;

    const handlerId = Symbol('save-shortcut');

    const handleSave = () => {
      if (formRefInternal.current?.current) {
        formRefInternal.current.current.requestSubmit();
      } else if (onSaveRef.current) {
        onSaveRef.current();
      }
    };

    const handlerEntry: ActiveHandler = {
      id: handlerId,
      priority,
      handleSave,
      stopPropagation,
      preventDefault,
    };

    // Insere mantendo a ordenação por prioridade crescente
    const insertIndex = activeHandlers.findIndex((h) => h.priority > priority);
    if (insertIndex === -1) {
      activeHandlers.push(handlerEntry);
    } else {
      activeHandlers.splice(insertIndex, 0, handlerEntry);
    }

    return () => {
      const index = activeHandlers.findIndex((h) => h.id === handlerId);
      if (index !== -1) {
        activeHandlers.splice(index, 1);
      }
    };
  }, [enabled, priority, preventDefault, stopPropagation]);
}
