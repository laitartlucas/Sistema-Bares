import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import type { StoreConfig, PriceCalcMethod } from '@pizzaria/shared'
import { configApi } from '../api/config'
import { useToast } from '../hooks/useToast'
import { Input, Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

type FormState = {
  nome: string
  endereco: string
  telefone: string
  taxaEntrega: string
  horarioFuncionamento: string
  calcPrecoSabor: PriceCalcMethod
}

const DEFAULTS: FormState = {
  nome: '',
  endereco: '',
  telefone: '',
  taxaEntrega: '5',
  horarioFuncionamento: '',
  calcPrecoSabor: 'MAIOR_PRECO',
}

function fromConfig(c: StoreConfig): FormState {
  return {
    nome:                  c.nome ?? '',
    endereco:              c.endereco ?? '',
    telefone:              c.telefone ?? '',
    taxaEntrega:           String(c.taxaEntrega ?? '5'),
    horarioFuncionamento:  c.horarioFuncionamento ?? '',
    calcPrecoSabor:        c.calcPrecoSabor ?? 'MAIOR_PRECO',
  }
}

export function ConfigPage() {
  const [form, setForm]       = useState<FormState>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    configApi.get()
      .then((c) => { if (c) setForm(fromConfig(c)) })
      .catch(() => toast('Erro ao carregar configurações', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  function set<K extends keyof FormState>(key: K) {
    return (value: FormState[K]) => setForm((p) => ({ ...p, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await configApi.update({
        nome:                 form.nome,
        endereco:             form.endereco || undefined,
        telefone:             form.telefone || undefined,
        taxaEntrega:          parseFloat(form.taxaEntrega),
        horarioFuncionamento: form.horarioFuncionamento || undefined,
        calcPrecoSabor:       form.calcPrecoSabor,
      })
      toast('Configurações salvas!', 'success')
    } catch {
      toast('Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-slate-800">Configurações</h1>

      {/* Informações */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-700">Informações do Estabelecimento</h2>
        <Input label="Nome" value={form.nome}
          onChange={(e) => set('nome')(e.target.value)} />
        <Input label="Endereço" value={form.endereco}
          onChange={(e) => set('endereco')(e.target.value)} />
        <Input label="Telefone de contato" type="tel" value={form.telefone}
          onChange={(e) => set('telefone')(e.target.value)} />
        <Input label="Horário de funcionamento" placeholder="Seg-Sáb 18h às 23h"
          value={form.horarioFuncionamento}
          onChange={(e) => set('horarioFuncionamento')(e.target.value)} />
      </section>

      {/* Entrega */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-700">Entrega e Preços</h2>
        <Input label="Taxa de entrega (R$)" type="number" step="0.01" value={form.taxaEntrega}
          onChange={(e) => set('taxaEntrega')(e.target.value)} />
        <Select
          label="Método de cálculo de preço de pizza"
          value={form.calcPrecoSabor}
          onChange={(e) => set('calcPrecoSabor')(e.target.value as PriceCalcMethod)}
          options={[
            { value: 'MAIOR_PRECO', label: 'Maior preço entre os sabores' },
            { value: 'MEDIA_PRECO', label: 'Média dos preços dos sabores' },
          ]}
        />
      </section>

      <Button size="lg" leftIcon={<Save size={16} />} loading={saving} onClick={handleSave}>
        Salvar configurações
      </Button>
    </div>
  )
}
