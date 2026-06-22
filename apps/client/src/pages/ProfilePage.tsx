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
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-display text-2xl font-bold text-pizza-dark">Meu Perfil</h1>
      </div>

      <div className="px-4 flex flex-col gap-5 pb-6">
        {/* User card */}
        <div className="bg-white rounded-3xl shadow-soft p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-pizza-red flex items-center justify-center text-2xl text-white font-display font-bold shrink-0">
            {user?.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-pizza-dark text-lg leading-tight">{user?.nome}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-pizza-muted text-sm flex items-center gap-1">
                <Phone size={13} />
                {user?.telefone ? formatPhone(user.telefone) : '—'}
              </p>
              <button
                onClick={() => { setNewPhone(user?.telefone ?? ''); setShowEditPhone(true) }}
                className="text-pizza-red p-0.5 press-effect"
                title="Editar telefone"
              >
                <Pencil size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Endereços */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-pizza-dark">Meus endereços</h2>
            <button
              onClick={() => setShowAddAddr(true)}
              className="flex items-center gap-1 text-pizza-red text-sm font-semibold press-effect"
            >
              <Plus size={15} />
              Adicionar
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-6 text-center">
              <MapPin size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-pizza-muted text-sm">Nenhum endereço cadastrado</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-2xl shadow-card p-4 flex items-start gap-3">
                  <MapPin size={18} className="text-pizza-muted flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-pizza-dark text-sm">
                      {addr.rua}, {addr.numero}
                    </p>
                    <p className="text-xs text-pizza-muted">{addr.bairro}{addr.complemento ? ` · ${addr.complemento}` : ''}</p>
                    {addr.referencia && <p className="text-xs text-pizza-muted">{addr.referencia}</p>}
                    {addr.principal && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-brand-100 text-pizza-red font-semibold px-2 py-0.5 rounded-full mt-1">
                        <Star size={9} fill="currentColor" /> Principal
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleRemoveAddress(addr.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ações */}
        <section className="bg-white rounded-3xl shadow-card overflow-hidden">
          <button
            onClick={() => navigate('/orders')}
            className="w-full flex items-center gap-3 p-4 hover:bg-brand-50 transition-colors border-b border-gray-100 press-effect"
          >
            <span className="text-pizza-muted text-sm font-medium flex-1 text-left">Meus pedidos</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors press-effect text-red-500"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="text-sm font-semibold flex-1 text-left">Sair da conta</span>
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
