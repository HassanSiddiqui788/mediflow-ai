'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  id?: string;
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  icon,
  className,
  menuClassName,
  disabled = false,
  id,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const dropdownId = id || autoId;

  // Normalize options to DropdownOption objects
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedIndex = normalizedOptions.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? normalizedOptions[selectedIndex] : undefined;

  // Click outside and keydown listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      setHighlightedIndex(next ? (selectedIndex >= 0 ? selectedIndex : 0) : -1);
      return next;
    });
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        handleSelect(normalizedOptions[highlightedIndex].value);
      }
    }
  };

  return (
    <div
      className={cn('relative inline-block text-left select-none', className)}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        id={dropdownId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleOpen}
        className={cn(
          'h-9 px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50',
          'text-xs font-semibold text-zinc-900 shadow-xs transition-all duration-150',
          'flex items-center justify-between gap-2.5 min-w-[140px] cursor-pointer',
          'focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400',
          isOpen && 'border-zinc-400 ring-1 ring-zinc-400 bg-zinc-50/50 shadow-sm',
          disabled && 'opacity-50 cursor-not-allowed bg-zinc-100'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon ? (
            <span className="text-zinc-500 shrink-0">{icon}</span>
          ) : selectedOption?.icon ? (
            <span className="text-zinc-500 shrink-0">{selectedOption.icon}</span>
          ) : null}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>

        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-zinc-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-zinc-700'
          )}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          aria-labelledby={dropdownId}
          className={cn(
            'absolute left-0 top-full mt-1.5 w-full min-w-[170px] z-50',
            'bg-white border border-zinc-200/90 rounded-xl shadow-xl shadow-zinc-900/10 p-1',
            'animate-in fade-in zoom-in-95 duration-150 origin-top',
            menuClassName
          )}
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
            {normalizedOptions.map((opt, index) => {
              const isSelected = opt.value === value;
              const isHighlighted = highlightedIndex === index;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left',
                    isSelected
                      ? 'text-zinc-900 font-semibold bg-zinc-100/90'
                      : isHighlighted
                      ? 'text-zinc-900 bg-zinc-100/60 font-medium'
                      : 'text-zinc-600 font-medium'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {opt.icon && <span className="text-zinc-500 shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-zinc-700 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
