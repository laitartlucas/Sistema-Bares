import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Home, CreditCard, Banknote, QrCode, ChevronDown, Plus } from 'lucide-react'
import type { Address, PaymentMethod, StoreConfig } from '@pizzaria/shared'
import { authApi } from '../api/auth'
import { menuApi } from '../api/menu'
import { ordersApi } from '../api/orders'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { formatCurrency } from '../utils/format'
import { cn } from '../utils/cn'

type DeliveryType = 'ENTREGA' | 'RETIRADA'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'PIX',     label: 'PIX',              icon: <QrCode size={20} /> },
  { value: 'CARTAO',  label: 'Cartão na entrega', icon: <CreditCard size={20} /> },
  { value: 'DINHEIRO', label: 'Dinheiro',         icon: <Banknote size={20} /> },
]

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [addresses, setAddresses]       = useState<Address[]>([])
  const [config, setConfig]             = useState<StoreConfig | null>(null)
  const [loading, setLoading]           = useState(false)
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('ENTREGA')
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(null)
  const [payment, setPayment]           = useState<PaymentMethod>('PIX')
  const [troco, setTroco]               = useState('')
  const [newAddr, setNewAddr]           = useState({ rua: '', numero: '', bairro: '', complemento: '' })
  const [showNewAddr, setShowNewAddr]   = useState(false)

  useEffect(() => {
    Promise.all([authApi.listAddresses(), menuApi.getConfig()])
      .then(([a, c]) => {
        setAddresses(a)
        setConfig(c)
        const principal = a.find((addr) => addr.principal) ?? a[0]
        if (principal) setSelectedAddr(principal)
      })
      .catch(() => toast('Erro ao carregar dados', 'error'))
  }, [])

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const taxaEntrega = deliveryType === 'ENTREGA' ? Number(config?.taxaEntrega ?? 0) : 0
  const totalFinal  = total + taxaEntrega

  async function handlePlaceOrder() {
    if (deliveryType === 'ENTREGA' && !selectedAddr && !newAddr.rua) {
      toast('Informe o endereço de entrega', 'error')
      return
    }

    setLoading(true)
    try {
      // Monta os itens para a API
      const itens = items.map((item) => {
        if (item.tipo === 'PIZZA') {
          return {
            tipo: 'PIZZA' as const,
            tamanhoId: item.tamanho.id,
            bordaId: item.borda.id,
            saborIds: item.sabores.map((s) => s.id),
            quantidade: item.quantidade,
            observacoes: item.observacoes,
          }
        }
        return {
          tipo: 'BEBIDA' as const,
          bebidaId: item.bebida.id,
          quantidade: item.quantidade,
        }
      })

      const enderecoEntrega = deliveryType === 'ENTREGA'
        ? selectedAddr
          ? { rua: selectedAddr.rua, numero: selectedAddr.numero, bairro: selectedAddr.bairro, complemento: selectedAddr.complemento ?? undefined, referencia: selectedAddr.referencia ?? undefined }
          : { rua: newAddr.rua, numero: newAddr.numero, bairro: newAddr.bairro, complemento: newAddr.complemento || undefined }
        : undefined

      const order = await ordersApi.create({
        tipo: deliveryType,
        enderecoEntrega,
        formaPagamento: payment,
        trocoPara: payment === 'DINHEIRO' && troco ? Number(troco) : undefined,
        itens,
      })

      clear()
      toast('Pedido realizado! 🍕', 'success')
      navigate(`/orders/${order.id}`)
    } catch (err: any) {
      toast(err.message ?? 'Erro ao realizar pedido', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout hideNav>
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 pt-6 pb-40 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full border-2 border-pizza-border bg-white grid place-items-center text-pizza-dark press-effect">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-2xl sm:text-3xl text-pizza-dark">Finalizar pedido</h1>
        </div>

        {/* Entrega / Retirada */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-pizza-dark">Como quer receber?</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['ENTREGA', 'RETIRADA'] as DeliveryType[]).map((type) => (
              <button
                key={type}
                onClick={() => setDeliveryType(type)}
                className={cn(
                  'flex flex-col items-center gap-2 py-6 rounded-2xl border-2 transition-all duration-200 press-effect',
                  deliveryType === type
                    ? 'border-pizza-dark bg-pizza-dark text-pizza-cheese'
                    : 'border-pizza-line bg-white text-pizza-muted',
                )}
              >
                {type === 'ENTREGA' ? <Home size={24} /> : <MapPin size={24} />}
                <span className="text-sm font-bold">{type === 'ENTREGA' ? 'Entrega' : 'Retirada'}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Endereço */}
        {deliveryType === 'ENTREGA' && (
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-pizza-dark">Endereço de entrega</h2>
            {addresses.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => { setSelectedAddr(addr); setShowNewAddr(false) }}
                    className={cn(
                      'w-full bg-white rounded-2xl p-4 flex items-center gap-3 border-2 transition-all duration-200 press-effect text-left',
                      selectedAddr?.id === addr.id ? 'border-pizza-red bg-brand-50' : 'border-pizza-line',
                    )}
                  >
                    <MapPin size={18} className="text-pizza-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-pizza-ink text-[15px]">{addr.rua}, {addr.numero}</p>
                      <p className="text-[13px] text-pizza-muted">{addr.bairro}{addr.complemento ? ` · ${addr.complemento}` : ''}</p>
                    </div>
                    {addr.principal && (
                      <span className="text-xs bg-pizza-honey text-pizza-label font-bold px-2.5 py-1 rounded-full flex-shrink-0">Padrão</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => { setShowNewAddr(!showNewAddr); setSelectedAddr(null) }}
              className={cn(
                'w-full border-2 border-dashed rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors',
                showNewAddr ? 'border-pizza-red text-pizza-red bg-brand-50' : 'border-pizza-border text-pizza-muted hover:border-pizza-red hover:text-pizza-red',
              )}
            >
              <Plus size={16} />
              Outro endereço
            </button>
            {showNewAddr && (
              <div className="flex flex-col gap-3 animate-slide-up">
                <Input label="Rua" placeholder="Rua das Flores" value={newAddr.rua} onChange={(e) => setNewAddr((a) => ({ ...a, rua: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Número" placeholder="123" value={newAddr.numero} onChange={(e) => setNewAddr((a) => ({ ...a, numero: e.target.value }))} />
                  <Input label="Bairro" placeholder="Centro" value={newAddr.bairro} onChange={(e) => setNewAddr((a) => ({ ...a, bairro: e.target.value }))} />
                </div>
                <Input label="Complemento" placeholder="Apto 4, Casa B..." value={newAddr.complemento} onChange={(e) => setNewAddr((a) => ({ ...a, complemento: e.target.value }))} />
              </div>
            )}
          </section>
        )}

        {/* Pagamento */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-pizza-dark">Forma de pagamento</h2>
          <div className="flex flex-col gap-2.5">
            {PAYMENT_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setPayment(value)}
                className={cn(
                  'w-full bg-white rounded-2xl p-4 flex items-center gap-3 border-2 transition-all duration-200 press-effect',
                  payment === value ? 'border-pizza-red bg-brand-50' : 'border-pizza-line',
                )}
              >
                <span className={cn('transition-colors', payment === value ? 'text-pizza-red' : 'text-pizza-muted')}>{icon}</span>
                <span className={cn('font-bold text-sm flex-1 text-left', payment === value ? 'text-pizza-ink' : 'text-pizza-muted')}>{label}</span>
                {payment === value && <span className="w-5 h-5 rounded-full bg-pizza-red grid place-items-center"><span className="w-2 h-2 rounded-full bg-white" /></span>}
              </button>
            ))}
          </div>
          {payment === 'DINHEIRO' && (
            <div className="animate-slide-up">
              <Input
                label="Troco para (opcional)"
                placeholder="Ex: 100,00"
                type="number"
                inputMode="decimal"
                value={troco}
                onChange={(e) => setTroco(e.target.value)}
                leftIcon={<span className="text-pizza-muted text-sm font-medium">R$</span>}
              />
            </div>
          )}
        </section>

        {/* Resumo do pedido */}
        <section className="bg-white border-2 border-pizza-line rounded-3xl p-5 sm:p-6">
          <h2 className="font-display text-xl text-pizza-dark mb-3">Resumo</h2>
          <div className="flex flex-col gap-3 mb-4">
            {items.map((item) => {
              const nome = item.tipo === 'PIZZA'
                ? item.sabores.map((s) => s.nome).join(' + ')
                : `${item.bebida.nome}${item.bebida.volume ? ` ${item.bebida.volume}` : ''}`
              const subtitulo = item.tipo === 'PIZZA'
                ? `${item.tamanho.nome} · ${item.borda.nome}`
                : 'Bebida'
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-pizza-ink text-sm leading-tight">
                      <span className="text-pizza-red">{item.quantidade}×</span> {nome}
                    </p>
                    <p className="text-xs text-pizza-muted mt-0.5">{subtitulo}</p>
                    {item.tipo === 'PIZZA' && item.observacoes && (
                      <p className="text-xs text-pizza-muted mt-0.5 italic">"{item.observacoes}"</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-pizza-ink flex-shrink-0">
                    {formatCurrency(item.precoUnitario * item.quantidade)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex flex-col gap-2 border-t border-dashed border-pizza-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-pizza-muted">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
              <span className="font-medium text-pizza-ink">{formatCurrency(total)}</span>
            </div>
            {deliveryType === 'ENTREGA' && (
              <div className="flex justify-between text-sm">
                <span className="text-pizza-muted">Taxa de entrega</span>
                <span className="font-medium text-pizza-ink">{formatCurrency(taxaEntrega)}</span>
              </div>
            )}
            <div className="border-t border-dashed border-pizza-border pt-2 flex justify-between items-center">
              <span className="font-bold text-pizza-ink">Total</span>
              <span className="font-display text-2xl text-pizza-red">{formatCurrency(totalFinal)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-pizza-dark shadow-[0_-8px_30px_rgba(0,0,0,0.2)] px-4 py-4 pb-safe z-30">
        <div className="max-w-[860px] mx-auto">
          <Button variant="cheese" fullWidth size="lg" className="!rounded-full" loading={loading} onClick={handlePlaceOrder}>
            Confirmar pedido · {formatCurrency(totalFinal)}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
