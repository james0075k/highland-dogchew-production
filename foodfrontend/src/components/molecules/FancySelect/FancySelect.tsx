'use client';

/**
 * FancySelect — accessible, animated, brand-styled dropdown.
 *
 * Replaces native <select> wherever the OS-rendered option list breaks the
 * Highland aesthetic (sharp corners, system fonts, no animation). Keeps the
 * usability of a native select: keyboard nav, click-outside-to-close, mobile
 * tap targets, focus ring.
 *
 * Variants:
 *   "pill"     — short, single-line trigger for toolbars (Sort by, filters)
 *   "panel"    — taller trigger with optional helper text underneath the value
 *                (good for product size selection where price hint is shown)
 */

import React, {
  useState, useRef, useEffect, useCallback, useId, useMemo,
} from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface FancyOption<V extends string = string> {
  value: V;
  label: string;
  /** Small grey hint shown to the right (e.g. "£3.50") */
  hint?: string;
  /** Disable a single option */
  disabled?: boolean;
}

interface FancySelectProps<V extends string = string> {
  options: FancyOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Visible label rendered above the trigger (optional) */
  label?: string;
  /** Right-aligned link rendered next to the label (e.g. "Size guide") */
  labelAside?: React.ReactNode;
  /** Compact "pill" trigger or roomier "panel" trigger */
  variant?: 'pill' | 'panel';
  /** Set true to make the trigger fill its container width */
  fullWidth?: boolean;
  /** Override the trigger's className (advanced) */
  className?: string;
  /** Tiny prefix shown faded on the trigger before the value, e.g. "Sort:" */
  triggerPrefix?: string;
  /** Disable the entire control */
  disabled?: boolean;
  /** "bottom" (default) opens panel downward; "top" opens upward — useful inside
   *  bottom-sticky bars where the panel would otherwise clip below the viewport. */
  placement?: 'bottom' | 'top';
}

export default function FancySelect<V extends string = string>({
  options,
  value,
  onChange,
  label,
  labelAside,
  variant = 'panel',
  fullWidth = true,
  className = '',
  triggerPrefix,
  disabled = false,
  placement = 'bottom',
}: FancySelectProps<V>) {
  const [open, setOpen] = useState(false);
  /* highlightedIdx tracks keyboard focus inside the panel; -1 when mouse-only */
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);

  const rootRef    = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId  = useId();

  const selectedIdx = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value],
  );
  const selected = options[selectedIdx];

  /* ── Open / close ──────────────────────────────────────────────────────── */
  const close = useCallback(() => {
    setOpen(false);
    setHighlightedIdx(-1);
  }, []);

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen((o) => {
      const next = !o;
      if (next) setHighlightedIdx(selectedIdx);
      return next;
    });
  }, [disabled, selectedIdx]);

  /* Click-outside */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);

  /* Focus first highlighted option when panel opens */
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current?.querySelector<HTMLLIElement>('li[data-highlighted="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, highlightedIdx]);

  /* ── Keyboard ──────────────────────────────────────────────────────────── */
  const handleKey = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
        setHighlightedIdx(selectedIdx >= 0 ? selectedIdx : 0);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((i) => {
        let next = i + 1;
        while (next < options.length && options[next].disabled) next++;
        return next < options.length ? next : i;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((i) => {
        let next = i - 1;
        while (next >= 0 && options[next].disabled) next--;
        return next >= 0 ? next : i;
      });
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHighlightedIdx(options.findIndex((o) => !o.disabled));
    } else if (e.key === 'End') {
      e.preventDefault();
      for (let i = options.length - 1; i >= 0; i--) {
        if (!options[i].disabled) { setHighlightedIdx(i); break; }
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const opt = options[highlightedIdx];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        close();
        triggerRef.current?.focus();
      }
    }
  };

  /* ── Rendering ─────────────────────────────────────────────────────────── */
  const triggerBase =
    'group relative inline-flex items-center justify-between gap-2 ' +
    'border bg-white dark:bg-[#1e1510] text-[#2f1e14] dark:text-[#f5e9dc] ' +
    'border-[#e2d8c8] dark:border-[#3a2c23] hover:border-[#c8b6a6] dark:hover:border-[#5a4a3a] ' +
    'transition-[border-color,box-shadow,transform] duration-200 ease-out ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:border-amber-400 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ' +
    (open ? 'shadow-[0_8px_24px_-12px_rgba(120,80,30,0.25)] border-amber-400/70 dark:border-amber-500/60 ' : '');

  const triggerSize = variant === 'pill'
    ? 'h-10 rounded-full px-4 text-xs font-semibold tracking-wide'
    : 'min-h-[48px] rounded-xl px-4 py-2.5 text-sm font-semibold';

  return (
    <div
      ref={rootRef}
      className={`${fullWidth ? 'w-full' : 'inline-block'} ${className}`}
    >
      {/* ── Optional label row ───────────────────────────────────────────── */}
      {(label || labelAside) && (
        <div className="flex items-center justify-between mb-2.5">
          {label && (
            <p className="text-sm font-semibold text-[#2f1e14] dark:text-[#f5e9dc]">
              {label}
              {variant === 'panel' && selected && (
                <span className="ml-1.5 text-amber-700 dark:text-amber-400 font-normal">
                  {selected.label}
                </span>
              )}
            </p>
          )}
          {labelAside && <div className="text-xs">{labelAside}</div>}
        </div>
      )}

      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleKey}
        className={`${triggerBase} ${triggerSize} ${fullWidth ? 'w-full' : ''}`}
      >
        <span className="flex items-baseline gap-1.5 min-w-0">
          {triggerPrefix && (
            <span className="text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60 font-medium shrink-0">
              {triggerPrefix}
            </span>
          )}
          <span className="truncate">
            {selected?.label ?? 'Select…'}
          </span>
          {selected?.hint && variant === 'panel' && (
            <span className="text-xs font-normal text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60 shrink-0">
              {selected.hint}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#7A5C4F] dark:text-[#c8b6a6] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? 'rotate-180 text-amber-600 dark:text-amber-400' : ''
          }`}
        />
      </button>

      {/* ── Animated panel ───────────────────────────────────────────────── */}
      <div
        className={`relative z-30 transition-all duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open
            ? `opacity-100 ${placement === 'top' ? '-translate-y-1.5' : 'translate-y-1.5'} pointer-events-auto`
            : `opacity-0 ${placement === 'top' ? 'translate-y-1' : '-translate-y-1'} pointer-events-none`
        }`}
        aria-hidden={!open}
      >
        <ul
          id={listboxId}
          ref={panelRef}
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 right-0 ${placement === 'top' ? 'bottom-full mb-1' : 'mt-1'} max-h-[min(70vh,360px)] overflow-y-auto ` +
            `rounded-2xl border border-[#e8e0d0] dark:border-[#3a2c23] ` +
            `bg-white/95 dark:bg-[#1c1410]/95 backdrop-blur-xl ` +
            `shadow-[0_24px_60px_-20px_rgba(120,80,30,0.35),0_8px_20px_-12px_rgba(0,0,0,0.15)] ` +
            `dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] ` +
            `p-1.5 ` +
            `[scrollbar-width:thin] [scrollbar-color:rgba(180,140,80,0.35)_transparent]`}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIdx;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                data-highlighted={isHighlighted ? 'true' : undefined}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(opt.value);
                  close();
                  triggerRef.current?.focus();
                }}
                onMouseEnter={() => !opt.disabled && setHighlightedIdx(idx)}
                style={{
                  // Stagger entrance only when opening
                  transitionDelay: open ? `${Math.min(idx * 22, 140)}ms` : '0ms',
                }}
                className={
                  // Base
                  'group/opt relative flex items-center justify-between gap-3 ' +
                  'rounded-xl px-3.5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 ' +
                  'text-sm font-medium select-none ' +
                  'transition-[background-color,color,transform,opacity] duration-200 ' +
                  // Entrance
                  (open ? 'opacity-100 translate-x-0 ' : 'opacity-0 -translate-x-1 ') +
                  // Disabled
                  (opt.disabled
                    ? 'opacity-40 cursor-not-allowed text-[#7A5C4F] dark:text-[#5a4a3a] '
                    : 'cursor-pointer ') +
                  // Highlighted (keyboard or hover)
                  (isHighlighted && !opt.disabled
                    ? 'bg-amber-50/90 dark:bg-amber-900/15 text-[#2f1e14] dark:text-[#f5e9dc] '
                    : 'text-[#3a2820] dark:text-[#e8d8c5] ')
                }
              >
                {/* Left amber accent bar — animates in for selected */}
                <span
                  aria-hidden="true"
                  className={`absolute left-1 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-amber-500 dark:bg-amber-400 ` +
                    `transition-[height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ` +
                    (isSelected ? 'h-5 opacity-100' : 'h-0 opacity-0')}
                />

                <span className="flex items-baseline gap-2 min-w-0 pl-2">
                  <span className={`truncate ${isSelected ? 'font-bold' : ''}`}>
                    {opt.label}
                  </span>
                  {opt.hint && (
                    <span className="text-xs font-normal text-[#7A5C4F]/70 dark:text-[#c8b6a6]/60 shrink-0">
                      {opt.hint}
                    </span>
                  )}
                </span>

                {/* Trailing checkmark for selected */}
                <span
                  aria-hidden="true"
                  className={`shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ` +
                    (isSelected
                      ? 'opacity-100 scale-100 text-amber-600 dark:text-amber-400'
                      : 'opacity-0 scale-50')}
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
