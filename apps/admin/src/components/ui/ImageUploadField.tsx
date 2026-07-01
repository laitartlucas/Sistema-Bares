import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { adminMenuApi } from '../../api/menu'
import { useToast } from '../../hooks/useToast'
import { Spinner } from './Spinner'

interface ImageUploadFieldProps {
  label?: string
  value?: string
  onChange: (url: string) => void
}

export function ImageUploadField({ label = 'Foto', value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const { url } = await adminMenuApi.uploadImage(file)
      onChange(url)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao enviar imagem', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <Spinner />
          ) : value ? (
            <img src={value} alt="Pré-visualização" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-slate-400" />
          )}
        </button>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs font-semibold text-pizza-red hover:underline disabled:opacity-60 text-left"
          >
            {value ? 'Trocar imagem' : 'Carregar imagem'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
            >
              <X size={12} /> Remover
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
