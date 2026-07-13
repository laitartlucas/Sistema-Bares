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
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <FlavorCardSkeleton key={i} />)}
        </div>
      </Layout>
    )
  }

  return (
    <Layout hideNav>
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 pt-6 pb-40 flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="w-10 h-10 rounded-full border-2 border-pizza-border bg-white grid place-items-center text-pizza-dark press-effect">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
              <p className="text-sm text-pizza-muted">Monte sua pizza</p>
              <h1 className="font-display text-2xl text-pizza-dark leading-tight">{STEP_LABELS[step]}</h1>
            </div>
            {precoAtual !== null && (
              <span className="font-bold text-pizza-red text-lg">{formatCurrency(precoAtual)}</span>
            )}
          </div>
          {/* Progress */}
          <div className="flex gap-1.5 mt-4">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-all duration-300',
                  i <= stepIndex ? 'bg-pizza-red' : 'bg-pizza-line',
                )}
              />
            ))}
          </div>
        </div>

        {/* ── STEP: TAMANHO ─────────────────────────────── */}
        {step === 'size' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <p className="text-pizza-muted text-sm">Qual o tamanho da sua pizza?</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleSizeSelect(size)}
                  className={cn(
                    'bg-white rounded-2xl p-4 flex items-center gap-4 border-2 transition-all duration-200 press-effect text-left',
                    selectedSize?.id === size.id ? 'border-pizza-red bg-brand-50' : 'border-pizza-line',
                  )}
                >
                  <div className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0 bg-pizza-honey">
                    {size.ordem === 1 ? '🫘' : size.ordem === 4 ? '🎉' : '🍕'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-pizza-ink">{size.nome}</p>
                    <p className="text-xs text-pizza-muted mt-0.5">
                      {size.pedacos} pedaços · até {size.maxSabores} {size.maxSabores === 1 ? 'sabor' : 'sabores'}
                    </p>
                  </div>
                  <span className="font-bold text-pizza-red">{formatCurrency(size.preco)}</span>
                  {selectedSize?.id === size.id && <Check size={18} className="text-pizza-red flex-shrink-0" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: SABORES ─────────────────────────────── */}
        {step === 'flavors' && selectedSize && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-3 flex items-center gap-3 border-2 border-pizza-line">
              <div className="flex gap-1 flex-1">
                {Array.from({ length: selectedSize.maxSabores }).map((_, i) => (
                  <div key={i} className={cn('flex-1 h-2 rounded-full transition-all duration-300', i < selectedFlavors.length ? 'bg-pizza-red' : 'bg-pizza-line')} />
                ))}
              </div>
              <span className={cn('text-xs font-bold whitespace-nowrap', selectedFlavors.length === selectedSize.maxSabores ? 'text-pizza-red' : 'text-pizza-muted')}>
                {selectedFlavors.length}/{selectedSize.maxSabores} sabor{selectedFlavors.length !== 1 ? 'es' : ''}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="search"
                placeholder="Buscar sabor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white rounded-2xl border-2 border-pizza-border px-4 py-3 text-[15px] outline-none focus:border-pizza-cheese focus:ring-2 focus:ring-pizza-cheese/30 transition-all"
              />
              <div className="flex gap-2">
                {(['TODAS', 'SALGADA', 'DOCE'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={cn(
                      'flex-1 py-2 rounded-full text-xs font-bold transition-all border-2',
                      filterCat === cat ? 'bg-pizza-red text-white border-pizza-red' : 'bg-white text-pizza-muted border-pizza-border',
                    )}
                  >
                    {cat === 'TODAS' ? 'Todas' : cat === 'SALGADA' ? '🧀 Salgadas' : '🍫 Doces'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
              {filteredFlavors.map((flavor) => {
                const isSelected = selectedFlavors.some((s) => s.id === flavor.id)
                const isDisabled = !isSelected && selectedFlavors.length >= (selectedSize?.maxSabores ?? 1)
                return (
                  <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor)}
                    disabled={isDisabled}
                    className={cn(
                      'bg-white rounded-2xl p-3.5 flex flex-col gap-0.5 border-2 transition-all duration-150 press-effect text-left',
                      isSelected ? 'border-pizza-red bg-brand-50' : 'border-pizza-line',
                      isDisabled ? 'opacity-40 cursor-not-allowed' : '',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-pizza-ink text-sm leading-tight">{flavor.nome}</span>
                      {isSelected && <Check size={16} className="text-pizza-red flex-shrink-0" strokeWidth={2.5} />}
                    </div>
                    {flavor.descricao && (
                      <span className="text-xs text-pizza-muted leading-tight line-clamp-2">{flavor.descricao}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP: BORDA ───────────────────────────────── */}
        {step === 'crust' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center gap-2 p-3 bg-pizza-honey rounded-2xl">
              <AlertCircle size={16} className="text-pizza-label flex-shrink-0" />
              <p className="text-xs text-pizza-label font-bold">Escolha uma borda para continuar</p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3">
              {crusts.map((crust) => (
                <button
                  key={crust.id}
                  onClick={() => setSelectedCrust(crust)}
                  className={cn(
                    'bg-white rounded-2xl p-4 flex items-center gap-4 border-2 transition-all duration-200 press-effect',
                    selectedCrust?.id === crust.id ? 'border-pizza-red bg-brand-50' : 'border-pizza-line',
                  )}
                >
                  <div className="w-10 h-10 rounded-xl grid place-items-center text-lg flex-shrink-0 bg-pizza-honey">
                    {crust.preco === 0 ? '🍕' : '🧀'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-pizza-ink text-sm">{crust.nome}</p>
                    {crust.preco > 0 && <p className="text-xs text-pizza-muted">+{formatCurrency(crust.preco)}</p>}
                  </div>
                  {selectedCrust?.id === crust.id && <Check size={18} className="text-pizza-red flex-shrink-0" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: RESUMO ──────────────────────────────── */}
        {step === 'summary' && selectedSize && selectedCrust && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="bg-white border-2 border-pizza-line rounded-3xl overflow-hidden">
              <div className="bg-pizza-dark h-32 grid place-items-center text-6xl">🍕</div>
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h2 className="font-display text-xl text-pizza-dark">Sua Pizza</h2>
                  <p className="text-pizza-muted text-sm">{selectedSize.nome}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm gap-4">
                    <span className="text-pizza-muted">Sabores</span>
                    <span className="font-bold text-pizza-ink text-right">{selectedFlavors.map((f) => f.nome).join(' + ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-pizza-muted">Borda</span>
                    <span className="font-bold text-pizza-ink">{selectedCrust.nome}</span>
                  </div>
                  <div className="border-t border-dashed border-pizza-border pt-2 flex justify-between">
                    <span className="text-pizza-muted text-sm">Preço unitário</span>
                    <span className="font-bold text-pizza-red">{formatCurrency(selectedSize.preco)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-pizza-line rounded-2xl p-4 flex items-center justify-between">
              <span className="font-bold text-pizza-ink">Quantidade</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full border-2 border-pizza-border bg-white grid place-items-center text-pizza-dark press-effect">
                  <Minus size={16} />
                </button>
                <span className="font-bold text-pizza-dark w-6 text-center">{quantidade}</span>
                <button onClick={() => setQuantidade((q) => Math.min(10, q + 1))} className="w-9 h-9 rounded-full bg-pizza-red grid place-items-center text-white press-effect">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="bg-white border-2 border-pizza-line rounded-2xl p-4">
              <Textarea
                label="Observações (opcional)"
                placeholder="Sem cebola, capricha no queijo..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Barra fixa ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-pizza-dark shadow-[0_-8px_30px_rgba(0,0,0,0.2)] px-4 py-4 pb-safe z-30">
        <div className="max-w-[860px] mx-auto">
          {step !== 'summary' ? (
            <Button
              variant="cheese"
              fullWidth
              size="lg"
              className="!rounded-full"
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
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col flex-1 min-w-[160px]">
                <span className="text-[13px] text-pizza-muted">Total ({quantidade}x)</span>
                <span className="font-display text-2xl text-pizza-cheese">
                  {precoAtual !== null && formatCurrency(precoAtual * quantidade)}
                </span>
              </div>
              <Button variant="cheese" size="lg" className="!rounded-full" onClick={handleAddToCart}>
                Adicionar ao carrinho
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
