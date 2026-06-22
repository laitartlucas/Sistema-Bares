import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, CreditCard, Banknote, QrCode, MessageCircle } from 'lucide-react'
import type { PizzaSize, Crust, Flavor } from '@pizzaria/shared'
import { adminMenuApi } from '../api/menu'
import { adminOrdersApi } from '../api/orders'
import type { ManualOrderPayload } from '../api/orders'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { formatCurrency } from '../utils/format'
import { cn } from '../utils/cn'

type PayMethod = 'PIX' | 'CARTAO' | 'DINHEIRO'
type TipoEntrega = 'ENTREGA' | 'RETIRADA'

interface PizzaEntry {
  _key: string
  tamanhoId: string
  bordaId: string
  saborIds: string[]
  quantidade: number
}

const PAY_OPTIONS: { value: PayMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'PIX',      label: 'PIX',      icon: <QrCode size={16} /> },
  { value: 'CARTAO',   label: 'Cartão',   icon: <CreditCard size={16} /> },
  { value: 'DINHEIRO', label: 'Dinheiro', icon: <Banknote size={16} /> },
]

let keySeq = 0
function nextKey() { return String(++keySeq) }

export function ManualOrderPage() {
  const { toast } = useToast()

  // Menu data
  const [sizes,   setSizes]   = useState<PizzaSize[]>([])
  const [crusts,  setCrusts]  = useState<Crust[]>([])
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [menuLoading, setMenuLoading] = useState(true)

  // Customer
  const [phone, setPhone]       = useState('')
  const [name, setName]         = useState('')

  // Items
  const [pizzas, setPizzas] = useState<PizzaEntry[]>([
    { _key: nextKey(), tamanhoId: '', bordaId: '', saborIds: [], quantidade: 1 },
  ])

  // Delivery
  const [tipo, setTipo]           = useState<TipoEntrega>('ENTREGA')
  const [rua, setRua]             = useState('')
  const [numero, setNumero]       = useState('')
  const [bairro, setBairro]       = useState('')
  const [complemento, setCompl]   = useState('')

  // Payment
  const [payment, setPayment]     = useState<PayMethod>('PIX')
  const [troco, setTroco]         = useState('')

  // Options
  const [sendWA, setSendWA]       = useState(true)
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async () => {
    try {
      const [s, c, f] = await Promise.all([
        adminMenuApi.listSizes(),
        adminMenuApi.listCrusts(),
        adminMenuApi.listFlavors(),
      ])
      const activeSizes   = s.filter((x) => x.ativo)
      const activeCrusts  = c.filter((x) => x.ativo)
      const activeFlavors = f.filter((x) => x.ativo)
      setSizes(activeSizes)
      setCrusts(activeCrusts)
      setFlavors(activeFlavors)

      // Pré-selecionar o primeiro tamanho e borda disponíveis
      if (activeSizes[0] && activeCrusts[0]) {
        setPizzas([{ _key: nextKey(), tamanhoId: activeSizes[0].id, bordaId: activeCrusts[0].id, saborIds: [], quantidade: 1 }])
      }
    } catch {
      toast('Erro ao carregar cardápio', 'error')
    } finally {
      setMenuLoading(false)
    }
  }, [toast])

  useEffect(() => { void load() }, [load])

  // ── Pizza entry helpers ───────────────────────────────────────────────────

  function addPizza() {
    setPizzas((prev) => [
      ...prev,
      { _key: nextKey(), tamanhoId: sizes[0]?.id ?? '', bordaId: crusts[0]?.id ?? '', saborIds: [], quantidade: 1 },
    ])
  }

  function removePizza(key: string) {
    setPizzas((prev) => prev.filter((p) => p._key !== key))
  }

  function updatePizza(key: string, patch: Partial<Omit<PizzaEntry, '_key'>>) {
    setPizzas((prev) => prev.map((p) => (p._key === key ? { ...p, ...patch } : p)))
  }

  function toggleFlavor(pizzaKey: string, flavorId: string, maxSabores: number) {
    setPizzas((prev) =>
      prev.map((p) => {
        if (p._key !== pizzaKey) return p
        const has = p.saborIds.includes(flavorId)
        if (has) return { ...p, saborIds: p.saborIds.filter((id) => id !== flavorId) }
        if (p.saborIds.length >= maxSabores) return p
        return { ...p, saborIds: [...p.saborIds, flavorId] }
      }),
    )
  }

  // ── Computed totals ───────────────────────────────────────────────────────

  function getSize(id: string) { return sizes.find((s) => s.id === id) }

  const subtotal = pizzas.reduce((acc, p) => {
    const size = getSize(p.tamanhoId)
    return acc + (size ? size.preco * p.quantidade : 0)
  }, 0)

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!phone.trim()) { toast('Informe o telefone do cliente', 'error'); return }
    if (!name.trim())  { toast('Informe o nome do cliente', 'error'); return }
    if (pizzas.some((p) => !p.tamanhoId || !p.bordaId || p.saborIds.length === 0)) {
      toast('Preencha tamanho, borda e ao menos 1 sabor em cada pizza', 'error')
      return
    }
    if (tipo === 'ENTREGA' && (!rua.trim() || !numero.trim() || !bairro.trim())) {
      toast('Preencha o endereço de entrega', 'error')
      return
    }

    setSaving(true)
    try {
      const payload: ManualOrderPayload = {
        customerPhone: phone.replace(/\D/g, ''),
        customerName: name.trim(),
        tipo,
        enderecoEntrega: tipo === 'ENTREGA' ? { rua, numero, bairro, complemento: complemento || undefined } : undefined,
        formaPagamento: payment,
        trocoPara: payment === 'DINHEIRO' && troco ? Number(troco) : undefined,
        itens: pizzas.map((p) => ({
          tipo: 'PIZZA' as const,
          tamanhoId: p.tamanhoId,
          bordaId: p.bordaId,
          saborIds: p.saborIds,
          quantidade: p.quantidade,
        })),
        sendWhatsApp: sendWA,
      }

      await adminOrdersApi.createManual(payload)
      toast(`Pedido criado!${sendWA ? ' Mensagem enviada no WhatsApp.' : ''}`, 'success')

      // Reset form
      setPizzas([{ _key: nextKey(), tamanhoId: sizes[0]?.id ?? '', bordaId: crusts[0]?.id ?? '', saborIds: [], quantidade: 1 }])
      setPhone(''); setName(''); setRua(''); setNumero(''); setBairro(''); setCompl('')
      setPayment('PIX'); setTroco('')
    } catch (err: any) {
      toast(err.message ?? 'Erro ao criar pedido', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (menuLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-black text-slate-800">Pedido Manual</h1>
      <p className="text-sm text-slate-500 -mt-4">Registre pedidos recebidos por WhatsApp ou telefone.</p>

      {/* ── Cliente ─────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-700">Cliente</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Telefone"
            placeholder="11999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
          />
          <Input
            label="Nome"
            placeholder="João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </section>

      {/* ── Pizzas ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-700">Pizzas</h2>
          <button
            onClick={addPizza}
            className="flex items-center gap-1.5 text-sm font-semibold text-pizza-red hover:text-red-700 transition-colors"
          >
            <Plus size={16} /> Adicionar pizza
          </button>
        </div>

        {pizzas.map((pizza, idx) => {
          const size = getSize(pizza.tamanhoId)
          const maxSabores = size?.maxSabores ?? 1

          return (
            <div key={pizza._key} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 text-sm">Pizza {idx + 1}</span>
                {pizzas.length > 1 && (
                  <button onClick={() => removePizza(pizza._key)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Tamanho + Borda + Qtd */}
              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Tamanho"
                  value={pizza.tamanhoId}
                  onChange={(e) => updatePizza(pizza._key, { tamanhoId: e.target.value, saborIds: [] })}
                  options={sizes.map((s) => ({ value: s.id, label: `${s.nome} — ${formatCurrency(s.preco)}` }))}
                />
                <Select
                  label="Borda"
                  value={pizza.bordaId}
                  onChange={(e) => updatePizza(pizza._key, { bordaId: e.target.value })}
                  options={crusts.map((c) => ({ value: c.id, label: c.nome }))}
                />
                <Input
                  label="Qtd"
                  type="number"
                  min="1"
                  max="10"
                  value={String(pizza.quantidade)}
                  onChange={(e) => updatePizza(pizza._key, { quantidade: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </div>

              {/* Sabores */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Sabores — escolha até {maxSabores} ({pizza.saborIds.length}/{maxSabores})
                </p>
                <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
                  {flavors.map((f) => {
                    const selected = pizza.saborIds.includes(f.id)
                    const disabled = !selected && pizza.saborIds.length >= maxSabores
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggleFlavor(pizza._key, f.id, maxSabores)}
                        disabled={disabled}
                        className={cn(
                          'text-left text-xs px-3 py-2 rounded-lg border transition-all font-medium',
                          selected
                            ? 'bg-pizza-red/10 border-pizza-red text-pizza-red'
                            : disabled
                              ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300',
                        )}
                      >
                        {f.nome}
                        <span className="ml-1 text-[10px] text-slate-400">{f.categoria === 'DOCE' ? '🍫' : ''}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ── Entrega ─────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-slate-700">Entrega</h2>
        <div className="grid grid-cols-2 gap-2">
          {(['ENTREGA', 'RETIRADA'] as TipoEntrega[]).map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={cn(
                'py-3 rounded-xl border-2 text-sm font-semibold transition-all',
                tipo === t ? 'border-pizza-red bg-pizza-red/5 text-pizza-red' : 'border-slate-200 text-slate-500',
              )}
            >
              {t === 'ENTREGA' ? '🚚 Entrega' : '🏪 Retirada'}
            </button>
          ))}
        </div>

        {tipo === 'ENTREGA' && (
          <div className="space-y-3">
            <Input label="Rua" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua das Flores" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" />
              <Input label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Centro" />
            </div>
            <Input label="Complemento" value={complemento} onChange={(e) => setCompl(e.target.value)} placeholder="Apto 2, Casa B…" />
          </div>
        )}
      </section>

      {/* ── Pagamento ───────────────────────────────────── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-slate-700">Pagamento</h2>
        <div className="flex gap-2">
          {PAY_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setPayment(value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                payment === value ? 'border-pizza-red bg-pizza-red/5 text-pizza-red' : 'border-slate-200 text-slate-500',
              )}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        {payment === 'DINHEIRO' && (
          <Input
            label="Troco para (opcional)"
            type="number"
            placeholder="100,00"
            value={troco}
            onChange={(e) => setTroco(e.target.value)}
          />
        )}
      </section>

      {/* ── Resumo + Submit ──────────────────────────────── */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal ({pizzas.length} pizza{pizzas.length !== 1 ? 's' : ''})</span>
          <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
        </div>

        {/* WhatsApp toggle */}
        <button
          onClick={() => setSendWA((v) => !v)}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all',
            sendWA ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500',
          )}
        >
          <MessageCircle size={18} />
          {sendWA ? 'Enviar confirmação pelo WhatsApp' : 'Não enviar WhatsApp'}
        </button>

        <Button size="lg" loading={saving} onClick={handleSubmit} className="w-full">
          Criar pedido
        </Button>
      </section>
    </div>
  )
}
