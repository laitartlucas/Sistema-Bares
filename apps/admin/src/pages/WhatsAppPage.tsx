import { useState, useEffect } from 'react'
import { Wifi, WifiOff, QrCode, RefreshCw, CheckCircle2 } from 'lucide-react'
import { whatsappApi } from '../api/whatsapp'
import type { WhatsAppStatus } from '../api/whatsapp'
import { Spinner } from '../components/ui/Spinner'

export function WhatsAppPage() {
  const [info, setInfo]       = useState<WhatsAppStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const data = await whatsappApi.getStatus()
        if (!cancelled) setInfo(data)
      } catch {
        // silently ignore errors during polling
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    poll()
    const id = setInterval(poll, 4000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-slate-800">WhatsApp</h1>

      {loading && (
        <div className="flex justify-center py-16"><Spinner /></div>
      )}

      {!loading && info && (
        <>
          {/* Status card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
            {info.status === 'connected' && (
              <>
                <CheckCircle2 size={36} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Conectado!</p>
                  <p className="text-sm text-slate-500">WhatsApp está ativo e enviando mensagens.</p>
                </div>
              </>
            )}
            {info.status === 'qr' && (
              <>
                <QrCode size={36} className="text-amber-500 shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold text-slate-800">Aguardando conexão</p>
                  <p className="text-sm text-slate-500">Escaneie o QR code abaixo com o WhatsApp do número da pizzaria.</p>
                </div>
              </>
            )}
            {info.status === 'disconnected' && (
              <>
                <WifiOff size={36} className="text-red-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Desconectado</p>
                  <p className="text-sm text-slate-500">
                    Verifique se <code className="bg-slate-100 px-1 rounded">WHATSAPP_ENABLED=true</code> está no arquivo <code className="bg-slate-100 px-1 rounded">.env</code> da API.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* QR Code */}
          {info.status === 'qr' && info.qr && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold text-slate-600 text-center">
                Abra o WhatsApp no celular → Menu → Dispositivos conectados → Conectar dispositivo
              </p>
              <img src={info.qr} alt="QR Code WhatsApp" className="w-64 h-64 rounded-xl border border-slate-200" />
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw size={12} className="animate-spin" />
                Atualizando automaticamente…
              </div>
            </div>
          )}

          {/* Instructions */}
          {info.status === 'connected' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
              <p className="font-semibold text-emerald-800 text-sm">O que está ativado:</p>
              <ul className="text-sm text-emerald-700 space-y-1 list-disc list-inside">
                <li>Confirmação automática enviada ao cliente quando o pedido é criado</li>
                <li>Chave PIX incluída nas mensagens quando o pagamento é PIX</li>
                <li>Resumo do pedido enviado nos pedidos manuais</li>
              </ul>
            </div>
          )}

          {info.status === 'disconnected' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
              <p className="font-semibold text-slate-700 text-sm">Como ativar:</p>
              <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                <li>Abra o arquivo <code className="bg-white border border-slate-200 px-1 rounded">apps/api/.env</code></li>
                <li>Defina <code className="bg-white border border-slate-200 px-1 rounded">WHATSAPP_ENABLED=true</code></li>
                <li>Defina <code className="bg-white border border-slate-200 px-1 rounded">WHATSAPP_PIX_KEY</code> com sua chave PIX</li>
                <li>Reinicie a API — o QR code aparecerá aqui</li>
              </ol>
            </div>
          )}
        </>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Wifi size={12} />
        Status atualiza automaticamente a cada 4 segundos
      </div>
    </div>
  )
}
