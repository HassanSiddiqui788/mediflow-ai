import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within Tabs component');
  return ctx;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue: string;
  onValueChange?: (val: string) => void;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState<string>(value || defaultValue);

  const currentTab = value !== undefined ? value : activeTab;
  const handleTabChange = React.useCallback(
    (newVal: string) => {
      if (value === undefined) {
        setActiveTab(newVal);
      }
      onValueChange?.(newVal);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value: currentTab, onValueChange: handleTabChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-slate-900/80 p-1 text-slate-400 border border-slate-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  badge?: string | number;
}

export function TabsTrigger({
  value,
  badge,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: currentVal, onValueChange } = useTabs();
  const isActive = currentVal === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer select-none',
        isActive
          ? 'bg-slate-800 text-teal-300 font-semibold shadow-sm border border-slate-700/60'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
        className
      )}
      {...props}
    >
      {children}
      {badge !== undefined && (
        <span
          className={cn(
            'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
            isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: currentVal } = useTabs();
  if (currentVal !== value) return null;

  return (
    <div
      className={cn('mt-4 focus-visible:outline-none animate-in fade-in duration-150', className)}
      {...props}
    >
      {children}
    </div>
  );
}
