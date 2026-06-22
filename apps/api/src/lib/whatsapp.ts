import path from 'path'
import QRCode from 'qrcode'

type WsStatus = 'disconnected' | 'qr' | 'connected'

let sock: any = null
let qrDataUrl: string | null = null
let wsStatus: WsStatus = 'disconnected'

// TypeScript compiles import() to require() for CommonJS targets.
// Using new Function escapes that transformation so we can load ESM-only packages.
const esmImport = new Function('s', 'return import(s)') as (s: string) => Promise<any>

// Minimal silent logger compatible with Baileys' expected interface
const silentLogger = {
  level: 'silent',
  trace: () => {}, debug: () => {}, info: () => {},
  warn:  () => {}, error: () => {}, fatal: () => {},
  child: () => silentLogger,
}

export async function initWhatsApp(): Promise<void> {
  if (process.env.WHATSAPP_ENABLED !== 'true') {
    console.log('ℹ️  WhatsApp desabilitado (WHATSAPP_ENABLED != true)')
    return
  }

  try {
    const { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } =
      await esmImport('@whiskeysockets/baileys')

    const authDir = path.join(process.cwd(), '.whatsapp-session')
    const { state, saveCreds } = await useMultiFileAuthState(authDir)

    // Busca a versão mais recente do protocolo WhatsApp Web
    const { version } = await fetchLatestBaileysVersion()
    console.log(`📱 Usando WhatsApp Web v${version.join('.')}`)

    function connect() {
      sock = makeWASocket({
        version,
        auth: state,
        logger: silentLogger,
        browser: Browsers.windows('Chrome'),
        syncFullHistory: false,
        connectTimeoutMs: 60_000,
        generateHighQualityLinkPreview: false,
      })

      sock.ev.on('creds.update', saveCreds)

      sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update
        const code = (lastDisconnect?.error as any)?.output?.statusCode

        if (qr) {
          qrDataUrl = await QRCode.toDataURL(qr)
          wsStatus = 'qr'
          console.log('🔲 WhatsApp — QR disponível no painel admin (/whatsapp)')
        }

        if (connection === 'open') {
          wsStatus = 'connected'
          qrDataUrl = null
          console.log('✅ WhatsApp conectado!')
        }

        if (connection === 'close') {
          wsStatus = 'disconnected'
          console.log(`🔌 WhatsApp fechou — código: ${code} | loggedOut: ${DisconnectReason.loggedOut}`)
          if (code !== DisconnectReason.loggedOut) {
            console.log('🔄 WhatsApp reconectando em 10s...')
            setTimeout(connect, 10000)
          } else {
            console.log('❌ WhatsApp deslogado. Escaneie o QR novamente.')
          }
        }
      })
    }

    connect()
  } catch (err) {
    console.error('❌ Erro ao inicializar WhatsApp:', err)
  }
}

function normalizeDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Remove código do país 55 se o número tiver mais de 11 dígitos
  return (digits.startsWith('55') && digits.length > 11) ? digits.slice(2) : digits
}

/**
 * Resolve o JID correto consultando o servidor do WhatsApp.
 * Tenta o número com o 9º dígito e sem, para lidar com a transição brasileira.
 * Retorna o JID confirmado ou o JID base se não conseguir verificar.
 */
async function resolveJID(phone: string): Promise<string> {
  const digits = normalizeDigits(phone)
  const candidates: string[] = [`55${digits}@s.whatsapp.net`]

  // Gera candidato alternativo (com/sem 9º dígito)
  if (digits.length === 11) {
    // Tem 9º dígito → tenta sem: DDD (2) + sem o 9 + resto
    const sem9 = digits.slice(0, 2) + digits.slice(3)
    candidates.push(`55${sem9}@s.whatsapp.net`)
  } else if (digits.length === 10) {
    // Sem 9º dígito → tenta com: DDD (2) + 9 + número
    const com9 = digits.slice(0, 2) + '9' + digits.slice(2)
    candidates.push(`55${com9}@s.whatsapp.net`)
  }

  console.log(`🔍 WhatsApp verificando JIDs: ${candidates.join(', ')}`)

  for (const jid of candidates) {
    try {
      const bare = jid.replace('@s.whatsapp.net', '')
      const [result] = await sock.onWhatsApp(bare)
      if (result?.exists) {
        console.log(`✅ JID confirmado: ${result.jid}`)
        return result.jid
      }
    } catch {
      // continua tentando o próximo
    }
  }

  // Fallback: usa o primeiro candidato sem confirmação
  console.log(`⚠️  JID não verificado, usando fallback: ${candidates[0]}`)
  return candidates[0]
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!sock || wsStatus !== 'connected') return false

  try {
    const jid = await resolveJID(phone)
    console.log(`📤 WhatsApp → ${jid}`)
    await sock.sendMessage(jid, { text: message })
    return true
  } catch (err) {
    console.error('Erro ao enviar WhatsApp para', phone, err)
    return false
  }
}

export function getWhatsAppInfo() {
  return { status: wsStatus, qr: qrDataUrl }
}
