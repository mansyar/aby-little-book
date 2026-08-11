import { cleanup, fireEvent, render } from '@testing-library/react';
import { act, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useReaderGestures } from './useReaderGestures';

function Harness({ onNavigate }: { onNavigate: (direction: 'forward' | 'backward') => void }) {
  const { handlers, locked } = useReaderGestures({ onNavigate, lockDurationMs: 200 });
  return (
    <div data-testid="stage" {...handlers}>
      <button type="button" data-interactive>
        target
      </button>
      {locked ? <span data-testid="locked">locked</span> : null}
    </div>
  );
}

function SpeechHarness() {
  const [speaking, setSpeaking] = useState(true);
  const { handlers } = useReaderGestures({
    onNavigate: () => setSpeaking(false),
    lockDurationMs: 0,
  });
  return (
    <div data-testid="stage" {...handlers}>
      {speaking ? (
        <span data-testid="speaking">speaking</span>
      ) : (
        <span data-testid="silent">silent</span>
      )}
    </div>
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useReaderGestures', () => {
  it('navigates forward on a tap in the right edge zone', () => {
    const onNavigate = vi.fn();
    const { getByTestId } = render(<Harness onNavigate={onNavigate} />);
    const stage = getByTestId('stage');
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 1100, clientY: 400 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 1101, clientY: 400 });
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('forward');
  });

  it('navigates forward on a leftward swipe', () => {
    const onNavigate = vi.fn();
    const { getByTestId } = render(<Harness onNavigate={onNavigate} />);
    const stage = getByTestId('stage');
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 600, clientY: 400 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 400, clientY: 400 });
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('forward');
  });

  it('never navigates when the gesture starts on an interactive target', () => {
    const onNavigate = vi.fn();
    const { getByText } = render(<Harness onNavigate={onNavigate} />);
    const target = getByText('target');
    fireEvent.pointerDown(target, { pointerId: 1, clientX: 600, clientY: 400 });
    fireEvent.pointerUp(target, { pointerId: 1, clientX: 400, clientY: 400 });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('locks navigation after a committed gesture until the lock elapses', () => {
    vi.useFakeTimers();
    const onNavigate = vi.fn();
    const { getByTestId } = render(<Harness onNavigate={onNavigate} />);
    const stage = getByTestId('stage');
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 1100, clientY: 400 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 1101, clientY: 400 });
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('forward');
    // A second gesture while the lock is active must be ignored.
    fireEvent.pointerDown(stage, { pointerId: 2, clientX: 400, clientY: 400 });
    fireEvent.pointerUp(stage, { pointerId: 2, clientX: 1100, clientY: 400 });
    expect(onNavigate).toHaveBeenCalledTimes(1);
    // After the lock elapses, navigation works again.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.pointerDown(stage, { pointerId: 3, clientX: 1100, clientY: 400 });
    fireEvent.pointerUp(stage, { pointerId: 3, clientX: 1101, clientY: 400 });
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it('navigates with the keyboard when the stage has focus and no target is focused', () => {
    vi.useFakeTimers();
    const onNavigate = vi.fn();
    const { getByTestId } = render(<Harness onNavigate={onNavigate} />);
    const stage = getByTestId('stage');
    fireEvent.keyDown(stage, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('forward');
    // Let the transition lock elapse before the next keypress.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.keyDown(stage, { key: 'ArrowLeft' });
    expect(onNavigate).toHaveBeenCalledTimes(2);
    expect(onNavigate).toHaveBeenLastCalledWith('backward');
  });

  it('does not page-turn on arrow keys while an interactive target has focus', () => {
    const onNavigate = vi.fn();
    const { getByText } = render(<Harness onNavigate={onNavigate} />);
    const target = getByText('target');
    target.focus();
    fireEvent.keyDown(target, { key: 'ArrowRight' });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('delivers every committed navigation to the owner, which cancels active speech and hints', () => {
    const { getByTestId, queryByTestId } = render(<SpeechHarness />);
    const stage = getByTestId('stage');
    expect(queryByTestId('speaking')).not.toBeNull();
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 1100, clientY: 400 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 1101, clientY: 400 });
    expect(queryByTestId('speaking')).toBeNull();
    expect(queryByTestId('silent')).not.toBeNull();
  });
});
