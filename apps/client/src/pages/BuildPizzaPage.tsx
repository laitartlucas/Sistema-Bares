import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, ChevronRight, Minus, Plus, AlertCircle } from 'lucide-react'
import type { PizzaSize, Crust, Flavor } from '@pizzaria/shared'
import { menuApi } from '../api/menu'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { FlavorCardSkeleton } from '../components/ui/Skeleton'
import { Layout } from '../components/layout/Layout'
import { formatCurrency } from '../utils/format'
import { cn } from '../utils/cn'

type Step = 'size' | 'flavors' | 'crust' | 'summary'

const STEPS: Step[] = ['size', 'flavors', 'crust', 'summary']
const STEP_LABELS: Record<Step, string> = {
  size: 'Tamanho', flavors: 'Sabores', crust: 'Borda', summary: 'Resumo',
}

export default function BuildPizzaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addPizza } = useCart()
  const { toast } = useToast()

  const [step, setStep]                   = useState<Step>('size')
  const [sizes, setSizes]                 = useState<PizzaSize[]>([])
  const [flavors, setFlavors]             = useState<Flavor[]>([])
  const [crusts, setCrusts]               = useState<Crust[]>([])
  const [loading, setLoading]             = useState(true)
  const [selectedSize, setSelectedSize]   = useState<PizzaSize | null>(null)
  const [selectedFlavors, setSelectedFlavors] = useState<Flavor[]>([])
  const [selectedCrust, setSelectedCrust] = useState<Crust | null>(null)
  const [quantidade, setQuantidade]       = useState(1)
  const [observacoes, setObservacoes]     = useState('')
  const [search, setSearch]               = useState('')
  const [filterCat, setFilterCat]         = useState<'TODAS' | 'SALGADA' | 'DOCE'>('TODAS')

  useEffect(() => {
    Promise.all([menuApi.getSizes(), menuApi.getFlavors(), menuApi.getCrusts()])
      .then(([s, f, c]) => {
        setSizes(s); setFlavors(f); setCrusts(c)
        const preSize   = (location.state as any)?.preselectedSize as PizzaSize | undefined
        const preFlavor = (location.state as any)?.preselectedFlavor as Flavor | undefined
        if (preSize) {
          setSelectedSize(preSize)
          setStep('flavors')
        } else if (preFlavor) {
          setSelectedFlavors([preFlavor])
          setStep('size')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const stepIndex = STEPS.indexOf(step)
  const canGoNext = useMemo(() => {
    if (step === 'size')    return !!selectedSize
    if (step === 'flavors') return selectedFlavors.length >= 1
    if (step === 'crust')   return !!selectedCrust
    return true
  }, [step, selectedSize, selectedFlavors, selectedCrust])

  function toggleFlavor(f: Flavor) {
    const alreadySelected = selectedFlavors.some((s) => s.id === f.id)
    if (alreadySelected) {
      setSelectedFlavors((prev) => prev.filter((s) => s.id !== f.id))
    } else {
      if (!selectedSize || selectedFlavors.length >= selectedSize.maxSabores) {
        toast(`Máximo de ${selectedSize?.maxSabores ?? 1} sabor(es) para ${selectedSize?.nome}`, 'error')
        return
      }
      setSelectedFlavors((prev) => [...prev, f])
    }
  }

  function handleSizeSelect(size: PizzaSize) {
    setSelectedSize(size)
    // Limpa sabores extras ao mudar tamanho
    if (selectedFlavors.length > size.maxSabores) {
      setSelectedFlavors((prev) => prev.slice(0, size.maxSabores))
    }
  }

  function goNext() {
    const nextStep = STEPS[stepIndex + 1]
    if (nextStep) setStep(nextStep)
  }

  function goBack() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1])
    else navigate(-1)
  }

  function handleAddToCart() {
    if (!selectedSize || !selectedCrust || selectedFlavors.length === 0) return
    const preco = selectedSize.preco
    addPizza({
      tipo: 'PIZZA',
      tamanho: selectedSize,
      borda: selectedCrust,
      sabores: selectedFlavors,
      quantidade,
      precoUnitario: preco,
      observacoes: observacoes.trim() || undefined,
    })
    toast('Pizza adicionada ao carrinho! 🍕', 'success')
    navigate('/cart')
  }

  const precoAtual = selectedSize ? selectedSize.preco : null

  const filteredFlavors = flavors.filter((f) => {
    const matchCat = filterCat === 'TODAS' || f.categoria === filterCat
    const matchSearch = !search || f.nome.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) {
    return (
      <Layout hideNav>
        <div className="p-4 grid grid-cols-2 gap-3 mt-16">
          {Array.from({ length: 6 }).map((_, i) => <FlavorCardSkeleton key={i} />)}
        </div>
      </Layout>
    )
  }

  return (
    <Layout hideNav>
      {/* Header fixo */}
      <div className="sticky top-0 z-30 glass border-b border-brand-100/70 pt-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={goBack} className="w-9 h-9 rounded-2xl bg-white shadow-card flex items-center justify-center text-pizza-red press-effect">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-pizza-muted font-medium">Monte sua pizza</p>
            <h1 className="font-display font-bold text-pizza-dark text-base leading-tight">
              {STEP_LABELS[step]}
            </h1>
          </div>
          {precoAtual !== null && (
            <span className="text-sm font-bold text-pizza-red">{formatCurrency(precoAtual)}</span>
          )}
        </div>

        {/* Progress steps */}
        <div className="flex gap-1 px-4 pb-3">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all duration-300',
                i <= stepIndex ? 'bg-brand-flame' : 'bg-brand-100',
              )}
            />
          ))}
        </div>
      </div>

      {/* ── STEP: TAMANHO ─────────────────────────────────────────────────────── */}
      {step === 'size' && (
        <div className="px-4 py-5 flex flex-col gap-3 animate-fade-in">
          <p className="text-pizza-muted text-sm">Qual o tamanho da sua pizza?</p>
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => handleSizeSelect(size)}
              className={cn(
                'w-full bg-white rounded-2xl p-4 flex items-center gap-4 border-2 shadow-card transition-all duration-200 press-effect',
                selectedSize?.id === size.id ? 'border-pizza-red shadow-brand' : 'border-transparent',
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0',
                selectedSize?.id === size.id ? 'bg-pizza-red/10' : 'bg-brand-50',
              )}>
                {size.ordem === 1 ? '🫘' : size.ordem === 2 ? '🍕' : size.ordem === 3 ? '🍕' : '🎉'}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-pizza-dark">{size.nome}</p>
                <p className="text-xs text-pizza-muted mt-0.5">
                  {size.pedacos} pedaços · até {size.maxSabores} {size.maxSabores === 1 ? 'sabor' : 'sabores'}
                </p>
              </div>
              <span className="font-bold text-pizza-red text-sm">{formatCurrency(size.preco)}</span>
              {selectedSize?.id === size.id && (
                <Check size={18} className="text-pizza-red flex-shrink-0" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── STEP: SABORES ─────────────────────────────────────────────────────── */}
      {step === 'flavors' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Contador + barra */}
          <div className="px-4 pt-4">
            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-card border border-gray-100">
              <div className="flex gap-1 flex-1">
                {Array.from({ length: selectedSize!.maxSabores }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 h-2 rounded-full transition-all duration-300',
                      i < selectedFlavors.length ? 'bg-pizza-red' : 'bg-gray-200',
                    )}
                  />
                ))}
              </div>
              <span className={cn(
                'text-xs font-bold whitespace-nowrap',
                selectedFlavors.length === selectedSize!.maxSabores ? 'text-pizza-red' : 'text-pizza-muted',
              )}>
                {selectedFlavors.length}/{selectedSize!.maxSabores} sabor{selectedFlavors.length !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>

          {/* Search + Filtro */}
          <div className="px-4 flex flex-col gap-2">
            <input
              type="search"
              placeholder="Buscar sabor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pizza-red/30 focus:border-pizza-red transition-all"
            />
            <div className="flex gap-2">
              {(['TODAS', 'SALGADA', 'DOCE'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-semibold transition-all',
                    filterCat === cat ? 'bg-pizza-red text-white' : 'bg-white text-pizza-muted border border-gray-200',
                  )}
                >
                  {cat === 'TODAS' ? 'Todas' : cat === 'SALGADA' ? '🧀 Salgadas' : '🍫 Doces'}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de sabores */}
          <div className="flex flex-col gap-2 px-4 pb-32">
            {filteredFlavors.map((flavor) => {
              const isSelected = selectedFlavors.some((s) => s.id === flavor.id)
              const isDisabled = !isSelected && selectedFlavors.length >= (selectedSize?.maxSabores ?? 1)
              return (
                <button
                  key={flavor.id}
                  onClick={() => toggleFlavor(flavor)}
                  disabled={isDisabled}
                  className={cn(
                    'w-full bg-white rounded-2xl p-3 flex items-center gap-3 border-2 shadow-card transition-all duration-150 press-effect text-left',
                    isSelected ? 'border-pizza-red shadow-brand' : 'border-transparent',
                    isDisabled ? 'opacity-40 cursor-not-allowed' : '',
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                    isSelected ? 'bg-pizza-red/10' : 'bg-brand-50',
                  )}>
                    {flavor.categoria === 'DOCE' ? '🍫' : '🍕'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-pizza-dark text-sm leading-tight">{flavor.nome}</p>
                    {flavor.descricao && (
                      <p className="text-xs text-pizza-muted mt-0.5 leading-tight line-clamp-1">{flavor.descricao}</p>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={18} className="text-pizza-red flex-shrink-0" strokeWidth={2.5} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STEP: BORDA ───────────────────────────────────────────────────────── */}
      {step === 'crust' && (
        <div className="px-4 py-5 flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">Escolha uma borda para continuar</p>
          </div>
          {crusts.map((crust) => (
            <button
              key={crust.id}
              onClick={() => setSelectedCrust(crust)}
              className={cn(
                'w-full bg-white rounded-2xl p-4 flex items-center gap-4 border-2 shadow-card transition-all duration-200 press-effect',
                selectedCrust?.id === crust.id ? 'border-pizza-red shadow-brand' : 'border-transparent',
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                selectedCrust?.id === crust.id ? 'bg-pizza-red/10' : 'bg-brand-50',
              )}>
                {crust.preco === 0 ? '🍕' : '🧀'}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-pizza-dark text-sm">{crust.nome}</p>
              </div>
              {selectedCrust?.id === crust.id && (
                <Check size={18} className="text-pizza-red flex-shrink-0" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── STEP: RESUMO ──────────────────────────────────────────────────────── */}
      {step === 'summary' && selectedSize && selectedCrust && (
        <div className="px-4 py-5 flex flex-col gap-4 animate-fade-in pb-36">
          {/* Pizza preview */}
          <div className="bg-white rounded-4xl shadow-card-lg overflow-hidden">
            <div className="relative bg-brand-flame h-36 flex items-center justify-center text-6xl overflow-hidden">
              <div className="absolute inset-0 bg-hero-pattern opacity-50" />
              <span className="relative animate-float drop-shadow-lg">🍕</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-pizza-dark">Sua Pizza</h2>
                <p className="text-pizza-muted text-xs">{selectedSize.nome}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pizza-muted">Sabores</span>
                  <span className="font-medium text-pizza-dark text-right max-w-[200px]">
                    {selectedFlavors.map((f) => f.nome).join(' + ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pizza-muted">Borda</span>
                  <span className="font-medium text-pizza-dark">{selectedCrust.nome}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between">
                  <span className="text-pizza-muted text-sm">Preço unitário</span>
                  <span className="font-bold text-pizza-red">
                    {formatCurrency(selectedSize.preco)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantidade */}
          <div className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between">
            <span className="font-semibold text-pizza-dark">Quantidade</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-pizza-red press-effect border border-brand-200"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-pizza-dark w-6 text-center">{quantidade}</span>
              <button
                onClick={() => setQuantidade((q) => Math.min(10, q + 1))}
                className="w-9 h-9 rounded-xl bg-pizza-red flex items-center justify-center text-white shadow-brand press-effect"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white rounded-2xl shadow-card p-4">
            <Textarea
              label="Observações (opcional)"
              placeholder="Sem cebola, capricha no queijo..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── Botão fixo de avançar ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-brand-100/70 px-4 py-4 pb-safe z-30">
        {step !== 'summary' ? (
          <Button
            fullWidth
            size="lg"
            disabled={!canGoNext}
            onClick={goNext}
            rightIcon={<ChevronRight size={18} />}
          >
            {step === 'flavors'
              ? selectedFlavors.length === 0
                ? 'Escolha ao menos 1 sabor'
                : `Continuar com ${selectedFlavors.length} sabor${selectedFlavors.length > 1 ? 'es' : ''}`
              : 'Continuar'}
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm px-1 mb-1">
              <span className="text-pizza-muted">Total ({quantidade}x)</span>
              <span className="font-bold text-pizza-dark text-base">
                {precoAtual !== null && formatCurrency(precoAtual * quantidade)}
              </span>
            </div>
            <Button fullWidth size="lg" onClick={handleAddToCart}>
              Adicionar ao carrinho 🛒
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}
