import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { Flavor, Beverage, PizzaSize, Crust } from '@pizzaria/shared'
import { adminMenuApi } from '../api/menu'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'

type Tab = 'sabores' | 'bordas' | 'tamanhos' | 'bebidas'

const TABS: { key: Tab; label: string }[] = [
  { key: 'sabores',   label: 'Sabores' },
  { key: 'bordas',    label: 'Bordas' },
  { key: 'tamanhos',  label: 'Tamanhos' },
  { key: 'bebidas',   label: 'Bebidas' },
]

const FLAVOR_CATS = ['SALGADA', 'DOCE']

function ItemRow({ name, price, active, imagemUrl, onEdit, onToggle, onDelete }: {
  name: string; price?: number; active: boolean; imagemUrl?: string
  onEdit: () => void; onToggle: () => void; onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-slate-300 transition-colors">
      {imagemUrl !== undefined && (
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-lg">
          {imagemUrl ? <img src={imagemUrl} alt={name} className="w-full h-full object-cover" /> : '🥤'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-800 truncate">{name}</p>
        {price !== undefined && <p className="text-xs text-slate-400">{formatCurrency(price)}</p>}
      </div>
      <Badge variant={active ? 'green' : 'gray'}>{active ? 'Ativo' : 'Inativo'}</Badge>
      <button onClick={onToggle} className="text-slate-400 hover:text-slate-600 transition-colors">
        {active ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
      </button>
      <button onClick={onEdit} className="text-slate-400 hover:text-blue-500 transition-colors"><Pencil size={15} /></button>
      <button onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
    </div>
  )
}

export function MenuPage() {
  const [tab, setTab]             = useState<Tab>('sabores')
  const [loading, setLoading]     = useState(true)
  const [flavors, setFlavors]     = useState<Flavor[]>([])
  const [crusts, setCrusts]       = useState<Crust[]>([])
  const [sizes, setSizes]         = useState<PizzaSize[]>([])
  const [beverages, setBeverages] = useState<Beverage[]>([])
  const [modal, setModal]         = useState<{ type: Tab; item?: unknown } | null>(null)
  const [form, setForm]           = useState<Record<string, string>>({})
  const [saving, setSaving]       = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [f, c, s, b] = await Promise.all([
        adminMenuApi.listFlavors(),
        adminMenuApi.listCrusts(),
        adminMenuApi.listSizes(),
        adminMenuApi.listBeverages(),
      ])
      setFlavors(f); setCrusts(c); setSizes(s); setBeverages(b)
    } catch { toast('Erro ao carregar cardápio', 'error') }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { void load() }, [load])

  function openCreate(type: Tab) {
    setForm({ ativo: 'true' })
    setModal({ type })
  }

  function openEdit(type: Tab, item: Record<string, unknown>) {
    setForm(Object.fromEntries(Object.entries(item).map(([k, v]) => [k, String(v ?? '')])))
    setModal({ type, item })
  }

  async function handleSave() {
    if (!modal) return
    setSaving(true)
    const id = (modal.item as Record<string, string> | undefined)?.id
    try {
      const payload = {
        ...form,
        preco:       form.preco       ? parseFloat(form.preco)       : undefined,
        taxaEntrega: form.taxaEntrega ? parseFloat(form.taxaEntrega) : undefined,
        maxSabores:  form.maxSabores  ? parseInt(form.maxSabores)    : undefined,
        ativo:       form.ativo === 'true',
      }
      if (modal.type === 'sabores')  { id ? await adminMenuApi.updateFlavor(id, payload)   : await adminMenuApi.createFlavor(payload) }
      if (modal.type === 'bordas')   { id ? await adminMenuApi.updateCrust(id, payload)    : await adminMenuApi.createCrust(payload) }
      if (modal.type === 'tamanhos') { id ? await adminMenuApi.updateSize(id, payload)     : await adminMenuApi.createSize(payload) }
      if (modal.type === 'bebidas')  { id ? await adminMenuApi.updateBeverage(id, payload) : await adminMenuApi.createBeverage(payload) }
      toast(id ? 'Atualizado!' : 'Criado!', 'success')
      setModal(null)
      void load()
    } catch { toast('Erro ao salvar', 'error') }
    finally { setSaving(false) }
  }

  async function handleToggle(type: Tab, id: string) {
    try {
      if (type === 'sabores')  await adminMenuApi.toggleFlavor(id)
      if (type === 'bordas')   await adminMenuApi.toggleCrust(id)
      if (type === 'tamanhos') await adminMenuApi.toggleSize(id)
      if (type === 'bebidas')  await adminMenuApi.toggleBeverage(id)
      void load()
    } catch { toast('Erro ao alterar status', 'error') }
  }

  async function handleDelete(type: Tab, id: string) {
    if (!confirm('Excluir este item?')) return
    try {
      if (type === 'sabores')  await adminMenuApi.deleteFlavor(id)
      if (type === 'bordas')   await adminMenuApi.deleteCrust(id)
      if (type === 'tamanhos') await adminMenuApi.deleteSize(id)
      if (type === 'bebidas')  await adminMenuApi.deleteBeverage(id)
      toast('Excluído', 'success'); void load()
    } catch { toast('Erro ao excluir', 'error') }
  }

  function renderList() {
    if (loading) return <div className="flex justify-center py-16"><Spinner /></div>
    if (tab === 'sabores') return (
      <div className="space-y-2">
        {flavors.map((f) => (
          <ItemRow key={f.id} name={`${f.nome} (${f.categoria})`} active={f.ativo}
            onEdit={() => openEdit('sabores', f as unknown as Record<string, unknown>)}
            onToggle={() => handleToggle('sabores', f.id)}
            onDelete={() => handleDelete('sabores', f.id)} />
        ))}
      </div>
    )
    if (tab === 'bordas') return (
      <div className="space-y-2">
        {crusts.map((c) => (
          <ItemRow key={c.id} name={c.nome} price={c.preco} active={c.ativo}
            onEdit={() => openEdit('bordas', c as unknown as Record<string, unknown>)}
            onToggle={() => handleToggle('bordas', c.id)}
            onDelete={() => handleDelete('bordas', c.id)} />
        ))}
      </div>
    )
    if (tab === 'tamanhos') return (
      <div className="space-y-2">
        {sizes.map((s) => (
          <ItemRow key={s.id} name={`${s.nome} (${s.maxSabores} sabor${s.maxSabores > 1 ? 'es' : ''})`} active={s.ativo}
            onEdit={() => openEdit('tamanhos', s as unknown as Record<string, unknown>)}
            onToggle={() => handleToggle('tamanhos', s.id)}
            onDelete={() => handleDelete('tamanhos', s.id)} />
        ))}
      </div>
    )
    if (tab === 'bebidas') return (
      <div className="space-y-2">
        {beverages.map((b) => (
          <ItemRow key={b.id} name={`${b.nome} (${b.volume})`} price={b.preco} active={b.ativo} imagemUrl={b.imagemUrl ?? ''}
            onEdit={() => openEdit('bebidas', b as unknown as Record<string, unknown>)}
            onToggle={() => handleToggle('bebidas', b.id)}
            onDelete={() => handleDelete('bebidas', b.id)} />
        ))}
      </div>
    )
  }

  function renderForm() {
    if (tab === 'sabores') return (
      <div className="space-y-4">
        <Input label="Nome" value={form.nome ?? ''} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} required />
        <Input label="Descrição" value={form.descricao ?? ''} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} />
        <Select label="Categoria" value={form.categoria ?? 'SALGADA'} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
          options={FLAVOR_CATS.map((c) => ({ value: c, label: c }))} />
      </div>
    )
    if (tab === 'bordas') return (
      <div className="space-y-4">
        <Input label="Nome" value={form.nome ?? ''} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} required />
        <Input label="Preço adicional (R$)" type="number" step="0.01" value={form.preco ?? ''} onChange={(e) => setForm((p) => ({ ...p, preco: e.target.value }))} />
      </div>
    )
    if (tab === 'tamanhos') return (
      <div className="space-y-4">
        <Input label="Nome" value={form.nome ?? ''} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} required />
        <Input label="Máx. sabores" type="number" min="1" max="4" value={form.maxSabores ?? ''} onChange={(e) => setForm((p) => ({ ...p, maxSabores: e.target.value }))} />
      </div>
    )
    if (tab === 'bebidas') return (
      <div className="space-y-4">
        <Input label="Nome" value={form.nome ?? ''} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} required />
        <Input label="Volume (ex: 350ml)" value={form.volume ?? ''} onChange={(e) => setForm((p) => ({ ...p, volume: e.target.value }))} />
        <Input label="Preço (R$)" type="number" step="0.01" value={form.preco ?? ''} onChange={(e) => setForm((p) => ({ ...p, preco: e.target.value }))} />
        <Input label="Foto (URL da imagem)" placeholder="https://..." value={form.imagemUrl ?? ''} onChange={(e) => setForm((p) => ({ ...p, imagemUrl: e.target.value }))} />
        {form.imagemUrl && (
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
            <img src={form.imagemUrl} alt="Pré-visualização" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    )
  }

  const tabLabels: Record<Tab, string> = { sabores: 'Sabor', bordas: 'Borda', tamanhos: 'Tamanho', bebidas: 'Bebida' }
  const isEdit = !!(modal?.item as Record<string, string> | undefined)?.id

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800">Cardápio</h1>
        <Button leftIcon={<Plus size={16} />} onClick={() => openCreate(tab)}>
          Novo {tabLabels[tab]}
        </Button>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>{renderList()}</div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={`${isEdit ? 'Editar' : 'Novo'} ${tabLabels[tab]}`}>
        {renderForm()}
        <div className="flex gap-2 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setModal(null)}>Cancelar</Button>
          <Button className="flex-1" loading={saving} onClick={handleSave}>Salvar</Button>
        </div>
      </Modal>
    </div>
  )
}
