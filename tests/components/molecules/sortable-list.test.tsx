import React, { useState } from 'react';
import { createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SortableList } from '@/components/molecules/SortableList';

function pointerDownAt(element: HTMLElement, pointerId: number, clientX: number, clientY: number) {
  const event = createEvent.pointerDown(element);
  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: pointerId },
  });
  fireEvent(element, event);
}

function pointerMoveAt(target: Document, pointerId: number, clientX: number, clientY: number) {
  const event = createEvent.pointerMove(target);
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: pointerId },
  });
  fireEvent(target, event);
}

function pointerUpAt(target: Document, pointerId: number, clientX: number, clientY: number) {
  const event = createEvent.pointerUp(target);
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: pointerId },
  });
  fireEvent(target, event);
}

function cardRect(top: number, height = 72, left = 0, width = 420) {
  return { top, height, bottom: top + height, left, width, right: left + width, x: left, y: top } as DOMRect;
}

function SortableHarness() {
  const [items, setItems] = useState(['first', 'second', 'third']);

  return (
    <SortableList
      items={items}
      getItemId={(item) => item}
      getItemLabel={(item) => item}
      onReorder={(nextItems) => setItems(nextItems)}
      renderItem={(item) => <div data-testid={`content-${item}`}>{item}</div>}
      ariaLabel="Sortable items"
      className="flex flex-col gap-2"
    />
  );
}

describe('SortableList', () => {
  it('reorders any item type with pointer events and exposes the visual path', () => {
    render(<SortableHarness />);
    const first = screen.getByTestId('sortable-item-first');
    const second = screen.getByTestId('sortable-item-second');
    const third = screen.getByTestId('sortable-item-third');
    vi.spyOn(first, 'getBoundingClientRect').mockReturnValue(cardRect(0));
    vi.spyOn(second, 'getBoundingClientRect').mockReturnValue(cardRect(80));
    vi.spyOn(third, 'getBoundingClientRect').mockReturnValue(cardRect(160));

    pointerDownAt(first, 1, 24, 24);
    pointerMoveAt(document, 1, 24, 130);

    const list = screen.getByRole('list', { name: 'Sortable items' });
    expect(Array.from(list.children).map((child) => child.getAttribute('data-sortable-id') || child.getAttribute('data-testid')))
      .toEqual(['second', 'sortable-placeholder', 'third']);
    expect(screen.getByTestId('sortable-drag-preview')).toBeInTheDocument();

    pointerUpAt(document, 1, 24, 130);
    expect(within(list).getAllByRole('listitem').map((item) => item.getAttribute('data-sortable-id')))
      .toEqual(['second', 'first', 'third']);
  });

  it('supports keyboard movement and reports the controlled reorder metadata', () => {
    const onReorder = vi.fn();
    render(
      <SortableList
        items={['first', 'second', 'third']}
        getItemId={(item) => item}
        getItemLabel={(item) => item}
        onReorder={onReorder}
        renderItem={(item) => <span>{item}</span>}
      />
    );

    fireEvent.keyDown(screen.getByTestId('sortable-item-first'), { key: 'ArrowDown' });

    expect(onReorder).toHaveBeenCalledWith(['second', 'first', 'third'], {
      activeId: 'first',
      fromIndex: 0,
      toIndex: 1,
      ids: ['second', 'first', 'third'],
    });
  });
});
