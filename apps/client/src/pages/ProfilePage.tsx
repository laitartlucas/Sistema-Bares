import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, MapPin, LogOut, Plus, Trash2, ChevronRight, Star, Pencil } from 'lucide-react'
import type { Address } from '@pizzaria/shared'
import { authApi } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { Layout } from '../components/layout/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { formatPhone, sanitizePhone } from '../utils/format'

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [addresses, setAddresses]     = useState<Address[]>([])
  const [showAddAddr, setShowAddAddr] = useState(false)
  const [newAddr, setNewAddr] = useState({ rua: '', numero: '', bairro: '', complemento: '', referencia: '' })
  const [saving, setSaving]           = useState(false)

  // Editar telefone
  const [showEditPhone, setShowEditPhone] = useState(false)
  const [newPhone, setNewPhone]           = useState('')
  const [savingPhone, setSavingPhone]     = useState(false)

  useEffect(() => {
    authApi.listAddresses().then(setAddresses).catch(() => {})
  }, [])

  async function handleSavePhone() {
    const digits = sanitizePhone(newPhone)
    if (digits.length < 10) { toast('Telefone inválido', 'error'); return }
    setSavingPhone(true)
    try {
      await authApi.updateProfile({ telefone: digits })
      await refreshUser()
      setShowEditPhone(false)
      toast('Telefone atualizado!', 'success')
    } catch (err: any) {
      toast(err.message ?? 'Erro ao atualizar', 'error')
    } finally {
      setSavingPhone(false)
    }
  }

  async function handleAddAddress() {
    if (!newAddr.rua || !newAddr.numero || !newAddr.bairro) {
      toast('Preencha rua, número e bairro', 'error')
      return
    }
    setSaving(true)
    try {
      const addr = await authApi.addAddress({
        rua: newAddr.rua, numero: newAddr.numero, bairro: newAddr.bairro,
        complemento: newAddr.complemento || undefined,
        referencia: newAddr.referencia || undefined,
        principal: addresses.length === 0,
      })
      setAddresses((prev) => [...prev, addr])
      setShowAddAddr(false)
      setNewAddr({ rua: '', numero: '', bairro: '', complemento: '', referencia: '' })
      toast('Endereço adicionado!', 'success')
    } catch {
      toast('Erro ao salvar endereço', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveAddress(id: string) {
    await authApi.removeAddress(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    toast('Endereço removido', 'info')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <Layout>
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6">
        <h1 className="font-display text-3xl sm:text-4xl text-pizza-dark">Meu Perfil</h1>

        {/* User card */}
        <div className="bg-pizza-dark rounded-3xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-pizza-cheese text-pizza-dark grid place-items-center font-display text-2xl sm:text-3xl shrink-0">
            {user?.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-pizza-cream text-lg sm:text-xl leading-tight truncate">{user?.nome}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-pizza-muted text-sm flex items-center gap-1">
                <Phone size={13} />
                {user?.telefone ? formatPhone(user.telefone) : '—'}
              </p>
              <button
                onClick={() => { setNewPhone(user?.telefone ?? ''); setShowEditPhone(true) }}
                className="text-pizza-cream/90 bg-white/10 rounded-lg p-1 press-effect hover:bg-white/20 transition-colors"
                title="Editar telefone"
              >
                <Pencil size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Endereços */}
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl text-pizza-dark">Meus endereços</h2>
            <button
              onClick={() => setShowAddAddr(true)}
              className="text-pizza-red text-sm font-bold press-effect"
            >
              + Adicionar
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-pizza-border rounded-[18px] p-10 flex flex-col items-center gap-2">
              <MapPin size={26} className="text-pizza-muted/60" />
              <p className="text-pizza-muted text-sm">Nenhum endereço cadastrado</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white border-2 border-pizza-line rounded-2xl p-4 sm:px-5 flex items-center gap-3">
                  <MapPin size={18} className="text-pizza-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-pizza-ink text-[15px]">{addr.rua}, {addr.numero}</p>
                    <p className="text-[13px] text-pizza-muted">{addr.bairro}{addr.complemento ? ` · ${addr.complemento}` : ''}</p>
                    {addr.referencia && <p className="text-[13px] text-pizza-muted">{addr.referencia}</p>}
                  </div>
                  {addr.principal && (
                    <span className="inline-flex items-center gap-1 bg-pizza-honey text-pizza-label font-bold text-xs px-2.5 py-1 rounded-full flex-shrink-0">
                      <Star size={10} fill="currentColor" /> Padrão
                    </span>
                  )}
                  <button onClick={() => handleRemoveAddress(addr.id)} className="text-pizza-muted hover:text-pizza-red transition-colors p-1 flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ações */}
        <section className="bg-white border-2 border-pizza-line rounded-[18px] flex flex-col">
          <button
            onClick={() => navigate('/orders')}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-pizza-cream transition-colors border-b border-pizza-line press-effect font-bold text-[15px] text-pizza-ink"
          >
            Meus pedidos <ChevronRight size={16} className="text-pizza-muted" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-brand-50 transition-colors press-effect text-pizza-red font-bold text-[15px]"
          >
            <LogOut size={18} className="flex-shrink-0" />
            Sair da conta
          </button>
        </section>
      </div>

      {/* Modal editar telefone */}
      <Modal open={showEditPhone} onClose={() => setShowEditPhone(false)} title="Editar telefone">
        <div className="px-6 py-4 flex flex-col gap-4">
          <p className="text-sm text-pizza-muted">
            Digite apenas os dígitos com DDD, sem o +55.<br />
            Exemplo: <span className="font-mono font-semibold text-pizza-dark">54999258389</span>
          </p>
          <Input
            label="Novo telefone"
            type="tel"
            inputMode="numeric"
            placeholder="54999258389"
            value={newPhone}
            onChange={(e) => setNewPhone(sanitizePhone(e.target.value))}
            leftIcon={<Phone size={16} />}
          />
          <Button fullWidth onClick={handleSavePhone} loading={savingPhone}>
            Salvar
          </Button>
        </div>
      </Modal>

      {/* Modal de novo endereço */}
      <Modal open={showAddAddr} onClose={() => setShowAddAddr(false)} title="Novo endereço">
        <div className="px-6 py-4 flex flex-col gap-4">
          <Input label="Rua" placeholder="Rua das Flores" value={newAddr.rua} onChange={(e) => setNewAddr((a) => ({ ...a, rua: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Número" placeholder="123" value={newAddr.numero} onChange={(e) => setNewAddr((a) => ({ ...a, numero: e.target.value }))} />
            <Input label="Bairro" placeholder="Centro" value={newAddr.bairro} onChange={(e) => setNewAddr((a) => ({ ...a, bairro: e.target.value }))} />
          </div>
          <Input label="Complemento" placeholder="Apto 4" value={newAddr.complemento} onChange={(e) => setNewAddr((a) => ({ ...a, complemento: e.target.value }))} />
          <Input label="Referência" placeholder="Próximo ao mercado" value={newAddr.referencia} onChange={(e) => setNewAddr((a) => ({ ...a, referencia: e.target.value }))} />
          <Button fullWidth onClick={handleAddAddress} loading={saving}>
            Salvar endereço
          </Button>
        </div>
      </Modal>
    </Layout>
  )
}
