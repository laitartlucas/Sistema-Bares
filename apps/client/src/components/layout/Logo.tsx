import { cn } from '../../utils/cn'

interface LogoProps {
  /** Tamanho do selo em px (default 44) */
  size?: number
  /** Mostra o wordmark "Solange / DELIVERY" ao lado do selo */
  showWordmark?: boolean
  /** Escala do wordmark */
  wordmark?: 'sm' | 'md' | 'lg'
  className?: string
}

const WORDMARK_SIZES: Record<NonNullable<LogoProps['wordmark']>, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl sm:text-5xl',
}

/**
 * Marca "Solange Delivery": selo arredondado com o ícone + wordmark opcional.
 * Sem dependência de imagem — puramente tipográfico.
 */
export function Logo({ size = 44, showWordmark = true, wordmark = 'sm', className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        className="grid place-items-center rounded-2xl bg-brand-flame shadow-brand shrink-0 select-none"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        🍕
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-display text-pizza-cheese leading-none', WORDMARK_SIZES[wordmark])}>
            Solange
          </span>
          <span className="text-[10px] tracking-[3px] text-pizza-muted font-bold mt-0.5">
            DELIVERY
          </span>
        </span>
      )}
    </div>
  )
}
