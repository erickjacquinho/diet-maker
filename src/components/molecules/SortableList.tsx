'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface SortableItemRenderContext {
  id: string;
  index: number;
  visualIndex: number;
  isDragging: boolean;
  isPreview: boolean;
  itemProps: SortableItemProps;
}

export interface SortableItemProps {
  ref: React.RefCallback<HTMLElement>;
  onPointerDown: React.PointerEventHandler<HTMLElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLElement>;
  className: string;
  role: 'listitem';
  tabIndex: number;
  'data-testid': string;
  'data-sortable-id': string;
  'aria-label'?: string;
  'aria-posinset': number;
  'aria-setsize': number;
  'aria-keyshortcuts'?: string;
}

export interface SortableContainerProps {
  ref: React.RefCallback<HTMLElement>;
  className: string;
  role: 'list';
  'aria-label': string;
}

export interface SortablePlaceholderRenderContext {
  height: number | null;
  insertionIndex: number;
}

export interface SortableReorderMeta {
  activeId: string;
  fromIndex: number;
  toIndex: number;
  ids: string[];
}

export interface SortableListProps<T> {
  items: readonly T[];
  getItemId: (item: T, index: number) => string;
  renderItem: (item: T, context: SortableItemRenderContext) => React.ReactNode;
  onReorder: (items: T[], meta: SortableReorderMeta) => void;
  getItemLabel?: (item: T, index: number) => string;
  renderPlaceholder?: (context: SortablePlaceholderRenderContext) => React.ReactNode;
  renderContainer?: (props: SortableContainerProps, children: React.ReactNode) => React.ReactNode;
  renderItemWrapper?: (props: SortableItemProps, content: React.ReactNode) => React.ReactNode;
  renderPreview?: (item: T, context: SortableItemRenderContext) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  itemClassName?: string;
  placeholderClassName?: string;
  disabled?: boolean;
  announcementPortal?: boolean;
}

type PointerDragState = {
  phase: 'pending' | 'dragging';
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  sourceIndex: number;
  insertionIndex: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  element: HTMLElement;
};

export function SortableList<T>({
  items,
  getItemId,
  renderItem,
  onReorder,
  getItemLabel,
  renderPlaceholder,
  renderContainer,
  renderItemWrapper,
  renderPreview,
  ariaLabel = 'Itens para reordenar',
  className,
  itemClassName,
  placeholderClassName,
  disabled = false,
  announcementPortal = false,
}: SortableListProps<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);
  const [draggedHeight, setDraggedHeight] = useState<number | null>(null);
  const [draggedWidth, setDraggedWidth] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const firstItemTops = useRef(new Map<string, number>());
  const listRef = useRef<HTMLElement | null>(null);
  const pointerDragRef = useRef<PointerDragState | null>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);

  const setListRef = useCallback((node: HTMLElement | null) => {
    listRef.current = node;
  }, []);

  const entries = useMemo(
    () => items.map((item, index) => ({ item, id: getItemId(item, index), index })),
    [getItemId, items]
  );
  const visibleEntries = draggedId
    ? entries.filter((entry) => entry.id !== draggedId)
    : entries;
  const draggedEntry = draggedId
    ? entries.find((entry) => entry.id === draggedId)
    : undefined;

  const captureItemPositions = useCallback(() => {
    firstItemTops.current = new Map(
      Array.from(itemRefs.current.entries()).map(([id, node]) => [id, node.getBoundingClientRect().top])
    );
  }, []);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || firstItemTops.current.size === 0) return;

    const firstPositions = firstItemTops.current;
    firstItemTops.current = new Map();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const animatedNodes: HTMLElement[] = [];
    const frameIds: number[] = [];
    const usesAnimationFrame = typeof window.requestAnimationFrame === 'function';

    itemRefs.current.forEach((node, id) => {
      const firstTop = firstPositions.get(id);
      if (firstTop === undefined) return;

      const delta = firstTop - node.getBoundingClientRect().top;
      if (Math.abs(delta) < 1) return;

      animatedNodes.push(node);
      node.style.transition = 'none';
      node.style.transform = `translate3d(0, ${delta}px, 0)`;
      node.getBoundingClientRect();

      const play = () => {
        node.style.transition = '';
        node.style.transform = '';
      };
      frameIds.push(usesAnimationFrame ? window.requestAnimationFrame(play) : window.setTimeout(play, 0));
    });

    return () => {
      frameIds.forEach((frameId) => {
        if (usesAnimationFrame) window.cancelAnimationFrame(frameId);
        else window.clearTimeout(frameId);
      });
      animatedNodes.forEach((node) => {
        node.style.transition = '';
        node.style.transform = '';
      });
    };
  }, [draggedHeight, draggedId, dragTargetIndex, items]);

  useLayoutEffect(() => {
    const drag = pointerDragRef.current;
    const preview = dragPreviewRef.current;
    if (!drag || drag.phase !== 'dragging' || drag.id !== draggedId || !preview) return;

    preview.style.width = `${drag.width}px`;
    preview.style.height = `${drag.height}px`;
    preview.style.transform = `translate3d(${drag.currentX - drag.offsetX}px, ${drag.currentY - drag.offsetY}px, 0)`;
  }, [draggedHeight, draggedId, draggedWidth]);

  const announceMove = useCallback((item: T, toIndex: number, total: number) => {
    const label = getItemLabel?.(item, toIndex) ?? 'Item';
    setAnnouncement(`${label} movido para a posição ${toIndex + 1} de ${total}.`);
  }, [getItemLabel]);

  const resetDragState = useCallback(() => {
    pointerDragRef.current = null;
    setDraggedId(null);
    setDragTargetIndex(null);
    setDraggedHeight(null);
    setDraggedWidth(null);
  }, []);

  const commitOrder = useCallback((activeId: string, requestedInsertionIndex: number) => {
    const sourceIndex = entries.findIndex((entry) => entry.id === activeId);
    if (sourceIndex < 0) return;

    const remainingItems = items.filter((_, index) => index !== sourceIndex);
    const insertionIndex = Math.max(0, Math.min(requestedInsertionIndex, remainingItems.length));
    const movedItem = items[sourceIndex];
    const nextItems = [...remainingItems];
    nextItems.splice(insertionIndex, 0, movedItem);
    const ids = nextItems.map((item, index) => getItemId(item, index));
    if (ids.every((id, index) => id === entries[index]?.id)) return;

    captureItemPositions();
    onReorder(nextItems, {
      activeId,
      fromIndex: sourceIndex,
      toIndex: insertionIndex,
      ids,
    });
    announceMove(movedItem, insertionIndex, nextItems.length);
  }, [announceMove, captureItemPositions, entries, getItemId, items, onReorder]);

  const getPointerInsertionIndex = useCallback((activeId: string, clientY: number) => {
    const remainingEntries = entries.filter((entry) => entry.id !== activeId);
    const insertionIndex = remainingEntries.findIndex((entry) => {
      const node = itemRefs.current.get(entry.id);
      if (!node) return false;
      const rect = node.getBoundingClientRect();
      const list = listRef.current;
      const listRect = list?.getBoundingClientRect();
      const layoutTop = list && listRect && node.offsetParent === list
        ? listRect.top + node.offsetTop - list.scrollTop
        : rect.top;
      const height = node.offsetHeight || rect.height;
      return clientY < layoutTop + height / 2;
    });

    return insertionIndex < 0 ? remainingEntries.length : insertionIndex;
  }, [entries]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>, id: string) => {
    if (disabled || event.button !== 0 || pointerDragRef.current) return;

    pointerDragRef.current = {
      phase: 'pending',
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      sourceIndex: -1,
      insertionIndex: -1,
      offsetX: 0,
      offsetY: 0,
      width: 0,
      height: 0,
      element: event.currentTarget,
    };
  }, [disabled]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const pendingDrag = pointerDragRef.current;
    if (!pendingDrag || pendingDrag.pointerId !== event.pointerId) return;

    if (pendingDrag.phase === 'pending') {
      const distance = Math.hypot(event.clientX - pendingDrag.startX, event.clientY - pendingDrag.startY);
      if (distance < 4) return;

      const sourceIndex = entries.findIndex((entry) => entry.id === pendingDrag.id);
      if (sourceIndex < 0) {
        pointerDragRef.current = null;
        return;
      }

      const rect = pendingDrag.element.getBoundingClientRect();
      pendingDrag.phase = 'dragging';
      pendingDrag.sourceIndex = sourceIndex;
      pendingDrag.insertionIndex = sourceIndex;
      pendingDrag.currentX = event.clientX;
      pendingDrag.currentY = event.clientY;
      pendingDrag.offsetX = pendingDrag.startX - rect.left;
      pendingDrag.offsetY = pendingDrag.startY - rect.top;
      pendingDrag.width = rect.width || pendingDrag.element.offsetWidth || 320;
      pendingDrag.height = rect.height || pendingDrag.element.offsetHeight || 64;

      captureItemPositions();
      setDraggedId(pendingDrag.id);
      setDragTargetIndex(sourceIndex);
      setDraggedHeight(pendingDrag.height);
      setDraggedWidth(pendingDrag.width);
    }

    const drag = pointerDragRef.current;
    if (!drag || drag.phase !== 'dragging') return;

    event.preventDefault();
    drag.currentX = event.clientX;
    drag.currentY = event.clientY;
    if (dragPreviewRef.current) {
      dragPreviewRef.current.style.transform = `translate3d(${drag.currentX - drag.offsetX}px, ${drag.currentY - drag.offsetY}px, 0)`;
    }

    const insertionIndex = getPointerInsertionIndex(drag.id, event.clientY);
    if (drag.insertionIndex === insertionIndex) return;

    captureItemPositions();
    drag.insertionIndex = insertionIndex;
    setDragTargetIndex(insertionIndex);
    const movedItem = items[drag.sourceIndex];
    if (movedItem) announceMove(movedItem, insertionIndex, items.length);
  }, [announceMove, captureItemPositions, entries, getPointerInsertionIndex, items]);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.phase === 'dragging') {
      event.preventDefault();
      commitOrder(drag.id, drag.insertionIndex);
    }

    resetDragState();
  }, [commitOrder, resetDragState]);

  const handlePointerCancel = useCallback((event: PointerEvent) => {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    firstItemTops.current.clear();
    resetDragState();
  }, [resetDragState]);

  useEffect(() => {
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [handlePointerCancel, handlePointerMove, handlePointerUp]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>, id: string) => {
    if (disabled || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();

    const sourceIndex = entries.findIndex((entry) => entry.id === id);
    const targetIndex = event.key === 'ArrowUp' ? sourceIndex - 1 : sourceIndex + 1;
    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= items.length) return;
    commitOrder(id, targetIndex);
  }, [commitOrder, disabled, entries, items.length]);

  const renderPlaceholderNode = (key: string, insertionIndex: number) => {
    if (renderPlaceholder) {
      return (
        <React.Fragment key={key}>
          {renderPlaceholder({ height: draggedHeight, insertionIndex })}
        </React.Fragment>
      );
    }

    return (
      <div
        key={key}
        data-testid="sortable-placeholder"
        aria-hidden="true"
        ref={(node) => {
          if (node && draggedHeight) node.style.height = `${draggedHeight}px`;
        }}
        className={cn(
          'min-h-16 rounded-surface border border-primary bg-primary-soft/20 transition-transform duration-fast motion-reduce:transition-none',
          placeholderClassName
        )}
      />
    );
  };

  const createItemProps = (entry: (typeof entries)[number], visualIndex: number): SortableItemProps => ({
    ref: (node) => {
      if (node) itemRefs.current.set(entry.id, node);
      else itemRefs.current.delete(entry.id);
    },
    onPointerDown: (event) => handlePointerDown(event, entry.id),
    onKeyDown: (event) => handleKeyDown(event, entry.id),
    className: cn(
      'w-full cursor-grab touch-none select-none transition-transform duration-fast ease-standard motion-reduce:transition-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      draggedId !== null && 'will-change-transform',
      itemClassName
    ),
    role: 'listitem',
    'data-testid': `sortable-item-${entry.id}`,
    'data-sortable-id': entry.id,
    tabIndex: disabled ? -1 : 0,
    'aria-label': disabled
      ? undefined
      : `${getItemLabel?.(entry.item, entry.index) ?? `Item ${visualIndex + 1}`}, posição ${visualIndex + 1} de ${items.length}`,
    'aria-posinset': visualIndex + 1,
    'aria-setsize': items.length,
    'aria-keyshortcuts': disabled ? undefined : 'ArrowUp ArrowDown',
  });

  const renderItemNode = (entry: (typeof entries)[number], visualIndex: number) => {
    const itemProps = createItemProps(entry, visualIndex);
    const content = renderItem(entry.item, {
      id: entry.id,
      index: entry.index,
      visualIndex,
      isDragging: false,
      isPreview: false,
      itemProps,
    });

    return renderItemWrapper
      ? renderItemWrapper(itemProps, content)
      : <div {...itemProps}>{content}</div>;
  };

  const renderPreviewNode = (entry: (typeof entries)[number]) => {
    const context: SortableItemRenderContext = {
      id: entry.id,
      index: entry.index,
      visualIndex: dragTargetIndex ?? entry.index,
      isDragging: true,
      isPreview: true,
      itemProps: {
        ref: () => undefined,
        onPointerDown: () => undefined,
        onKeyDown: () => undefined,
        className: '',
        role: 'listitem',
        tabIndex: -1,
        'data-testid': 'sortable-drag-preview',
        'data-sortable-id': entry.id,
        'aria-posinset': (dragTargetIndex ?? entry.index) + 1,
        'aria-setsize': items.length,
      },
    };

    return renderPreview ? renderPreview(entry.item, context) : renderItem(entry.item, context);
  };

  const listContent = (
    <>
      {visibleEntries.map((entry, visualIndex) => (
        <React.Fragment key={entry.id}>
          {draggedId !== null && dragTargetIndex === visualIndex && renderPlaceholderNode(`placeholder-before-${entry.id}`, visualIndex)}
          {renderItemNode(entry, visualIndex)}
        </React.Fragment>
      ))}
      {draggedId !== null && dragTargetIndex === visibleEntries.length && renderPlaceholderNode('placeholder-after-list', visibleEntries.length)}
    </>
  );

  const containerProps: SortableContainerProps = {
    ref: setListRef,
    className: cn('relative', className),
    role: 'list',
    'aria-label': ariaLabel,
  };
  const listNode = renderContainer
    ? renderContainer(containerProps, listContent)
    : <div ref={setListRef} role="list" aria-label={ariaLabel} className={containerProps.className}>{listContent}</div>;

  const announcementNode = <span className="sr-only" role="status" aria-live="polite">{announcement}</span>;

  return (
    <>
      {draggedEntry && typeof document !== 'undefined' && createPortal(
        <div
          ref={dragPreviewRef}
          data-testid="sortable-drag-preview"
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-modal cursor-grabbing shadow-overlay ring-2 ring-inset ring-primary transition-none"
        >
          {renderPreviewNode(draggedEntry)}
        </div>,
        document.body
      )}
      {listNode}
      {announcementPortal && typeof document !== 'undefined'
        ? createPortal(announcementNode, document.body)
        : announcementNode}
    </>
  );
}
