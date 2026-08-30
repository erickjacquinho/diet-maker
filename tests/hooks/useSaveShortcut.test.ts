import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSaveShortcut } from '@/hooks/useSaveShortcut';

describe('useSaveShortcut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers onSave when Ctrl+S is pressed on Windows/Linux', () => {
    const onSave = vi.fn();
    const { unmount } = renderHook(() => useSaveShortcut({ onSave }));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalled();
    unmount();
  });

  it('triggers onSave when Cmd+S is pressed on macOS', () => {
    const onSave = vi.fn();
    const { unmount } = renderHook(() => useSaveShortcut({ onSave }));

    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalled();
    unmount();
  });

  it('does not trigger onSave when disabled', () => {
    const onSave = vi.fn();
    const { unmount } = renderHook(() =>
      useSaveShortcut({ onSave, enabled: false })
    );

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(onSave).not.toHaveBeenCalled();
    unmount();
  });

  it('prioritizes higher priority listener (e.g. modal over page)', () => {
    const pageSave = vi.fn();
    const modalSave = vi.fn();

    // Page mounts with priority 0
    const pageHook = renderHook(() =>
      useSaveShortcut({ onSave: pageSave, priority: 0 })
    );

    // Modal opens with priority 10
    const modalHook = renderHook(() =>
      useSaveShortcut({ onSave: modalSave, priority: 10 })
    );

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    // Only modal should have executed
    expect(modalSave).toHaveBeenCalledTimes(1);
    expect(pageSave).not.toHaveBeenCalled();

    modalHook.unmount();
    pageHook.unmount();
  });

  it('falls back to lower priority listener when higher priority unmounts', () => {
    const pageSave = vi.fn();
    const modalSave = vi.fn();

    const pageHook = renderHook(() =>
      useSaveShortcut({ onSave: pageSave, priority: 0 })
    );

    const modalHook = renderHook(() =>
      useSaveShortcut({ onSave: modalSave, priority: 10 })
    );

    // Modal closes
    modalHook.unmount();

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(modalSave).not.toHaveBeenCalled();
    expect(pageSave).toHaveBeenCalledTimes(1);

    pageHook.unmount();
  });
});
