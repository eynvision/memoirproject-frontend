import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-body font-medium ' +
  'transition-all duration-200 ease-out focus-visible:outline-none disabled:cursor-not-allowed ' +
  'disabled:opacity-40 disabled:saturate-50'

const variants: Record<Variant, string> = {
  primary:
    'bg-clay-500 text-cream px-8 py-3.5 shadow-card hover:bg-clay-600 hover:shadow-soft ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:bg-clay-700',
  secondary:
    'border border-ink/20 text-ink px-8 py-3.5 hover:border-ink/40 hover:bg-ink/[0.03] ' +
    'hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-ink/70 px-2 py-2 hover:text-ink underline-offset-4 hover:underline',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className = '', children, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
})

export default Button
