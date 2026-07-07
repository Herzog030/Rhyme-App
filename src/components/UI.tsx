import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import type { SongStatus } from '../lib/db';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-leaf-600 text-white hover:bg-leaf-700 shadow-pop/40 active:translate-y-px',
    secondary:
      'bg-cream-50 text-stone-800 border border-stone-200 hover:bg-cream-200 hover:border-stone-300',
    ghost: 'text-stone-700 hover:bg-cream-200',
    danger:
      'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  help?: string;
}

export function TextField({ label, help, className = '', id, ...props }: TextFieldProps) {
  const inputId = id ?? (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-stone-200 bg-cream-50 px-4 py-3 text-stone-900 transition-colors focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/15 ${className}`}
        {...props}
      />
      {help && <span className="mt-1 block text-xs text-stone-500">{help}</span>}
    </label>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  help?: string;
}

export function TextArea({ label, help, className = '', id, ...props }: TextAreaProps) {
  const inputId = id ?? (label ? `t-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
          {label}
        </span>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-xl border border-stone-200 bg-cream-50 px-4 py-3 text-stone-900 transition-colors focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/15 ${className}`}
        {...props}
      />
      {help && <span className="mt-1 block text-xs text-stone-500">{help}</span>}
    </label>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'button';
}

export function Card({ children, className = '', onClick, as = 'div' }: CardProps) {
  const Tag = as;
  return (
    <Tag
      {...(onClick ? { onClick } : {})}
      className={`rounded-2xl border border-stone-200 bg-cream-50 shadow-card ${
        onClick ? 'cursor-pointer text-left transition-all hover:border-stone-300 hover:shadow-pop/20' : ''
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-baseline justify-between">
      <h2 className="font-display text-xl font-semibold text-stone-900">{children}</h2>
      {action}
    </div>
  );
}

const STATUS_STYLE: Record<SongStatus, { label: string; className: string }> = {
  draft: {
    label: 'Entwurf',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  released: {
    label: 'Veröffentlicht',
    className: 'bg-leaf-100 text-leaf-800 border-leaf-200',
  },
};

export function StatusBadge({ status }: { status: SongStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-cream-50/60 px-6 py-10 text-center">
      <h3 className="font-display text-lg font-semibold text-stone-800">{title}</h3>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Toast({ message, tone = 'info' }: { message: string; tone?: 'info' | 'success' | 'error' }) {
  const tones = {
    info: 'bg-cream-200 text-stone-800 border-stone-300',
    success: 'bg-leaf-50 text-leaf-800 border-leaf-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  } as const;
  return (
    <div
      role="status"
      className={`rounded-xl border px-3 py-2 text-sm ${tones[tone]}`}
    >
      {message}
    </div>
  );
}
