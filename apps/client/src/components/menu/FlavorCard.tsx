import { Check } from 'lucide-react'
import type { Flavor } from '@pizzaria/shared'
import { cn } from '../../utils/cn'

// Gradiente por categoria
const FLAVOR_GRADIENTS: Record<string, string> = {
  Mussarela:                  'from-yellow-100 to-amber-200',
  Calabresa:                  'from-red-200 to-rose-300',
  Portuguesa:                 'from-orange-100 to-amber-300',
  'Frango c/ Catupiry':       'from-yellow-50 to-yellow-200',
  Pepperoni:                  'from-red-300 to-red-500',
  'Quatro Queijos':           'from-amber-100 to-yellow-300',
  Margherita:                 'from-green-100 to-emerald-200',
  Chocolate:                  'from-amber-800 to-stone-900',
  Brigadeiro:                 'from-amber-700 to-amber-900',
  'Romeu e Julieta':          'from-pink-100 to-red-200',
  'Nutella c/ Banana':        'from-amber-200 to-yellow-400',
  default_SALGADA:            'from-red-100 to-orange-200',
  default_DOCE:               'from-pink-100 to-rose-200',
}

function getGradient(flavor: Flavor): string {
  return FLAVOR_GRADIENTS[flavor.nome]
    ?? FLAVOR_GRADIENTS[`default_${flavor.categoria}`]
    ?? 'from-gray-100 to-gray-200'
}

interface FlavorCardProps {
  flavor: Flavor
  selected?: boolean
  disabled?: boolean
  onToggle?: () => void
  compact?: boolean
}

export function FlavorCard({ flavor, selected, disabled, onToggle, compact }: FlavorCardProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !selected}
      className={cn(
        'relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-card border-2 transition-all duration-200 press-effect text-left w-full',
        selected  ? 'border-pizza-red shadow-brand scale-[1.02]' : 'border-transparent',
        disabled && !selected ? 'opacity-50 cursor-not-allowed' : 'active:scale-95',
      )}
    >
      {/* Imagem / gradiente */}
      <div
        className={cn(
          'w-full bg-gradient-to-br',
          getGradient(flavor),
          compact ? 'aspect-[4/3]' : 'aspect-square',
          'flex items-center justify-center text-4xl select-none',
        )}
      >
        {flavor.imagemUrl
          ? <img src={flavor.imagemUrl} alt={flavor.nome} className="w-full h-full object-cover" />
          : <span>{flavor.categoria === 'DOCE' ? '🍫' : '🍕'}</span>
        }
      </div>

      {/* Checkmark overlay */}
      {selected && (
        <div className="absolute top-2 right-2 bg-pizza-red rounded-full p-1 shadow-md animate-bounce-in">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      )}

      {/* Info */}
      <div className="p-3 flex flex-col gap-0.5">
        <span className="font-semibold text-pizza-dark text-sm leading-tight line-clamp-1">
          {flavor.nome}
        </span>
        {!compact && flavor.descricao && (
          <span className="text-xs text-pizza-muted line-clamp-2 leading-tight">{flavor.descricao}</span>
        )}
      </div>
    </button>
  )
}
