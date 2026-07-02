import path from 'path'
import QRCode from 'qrcode'
import { Client, LocalAuth } from 'whatsapp-web.js'

type WsStatus = 'disconnected' | 'qr' | 'connected'

let client: any = null
let qrDataUrl: string | null = null
let wsStatus: WsStatus = 'disconnected'

export async function initWhatsApp(): Promise<void> {
  if (process.env.WHATSAPP_ENABLED !== 'true') {
    console.log('ℹ️  WhatsApp desabilitado (WHATSAPP_ENABLED != true)')
    return
  }

  try {
    const authDir = path.join(process.cwd(), '.whatsapp-session')

    const puppeteer: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
      ],
    }

    // Usa o Chromium do sistema (instalado via apt no Dockerfile) se definido
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteer.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    }

    client = new Client({
      authStrategy: new LocalAuth({ dataPath: authDir }),
      puppeteer,
    })

    client.on('qr', async (qr: string) => {
      qrDataUrl = await QRCode.toDataURL(qr)
      wsStatus = 'qr'
      console.log('🔲 WhatsApp — QR disponível no painel admin (/whatsapp)')
    })

    client.on('ready', () => {
      wsStatus = 'connected'
      qrDataUrl = null
      console.log('✅ WhatsApp conectado!')
    })

    client.on('disconnected', (reason: any) => {
      wsStatus = 'disconnected'
      console.log(`🔌 WhatsApp desconectado — motivo: ${reason}`)
    })

    client.on('auth_failure', (msg: any) => {
      wsStatus = 'disconnected'
      console.log(`❌ WhatsApp falha de autenticação: ${msg}. Escaneie o QR novamente.`)
    })

    await client.initialize()
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
 * Resolve o chat ID correto consultando o servidor do WhatsApp.
 * Tenta o número com o 9º dígito e sem, para lidar com a transição brasileira.
 * Retorna o ID confirmado (`<numero>@c.us`) ou o ID base se não conseguir verificar.
 */
async function resolveChatId(phone: string): Promise<string> {
  const digits = normalizeDigits(phone)
  const candidates: string[] = [`55${digits}`]

  // Gera candidato alternativo (com/sem 9º dígito)
  if (digits.length === 11) {
    // Tem 9º dígito → tenta sem: DDD (2) + sem o 9 + resto
    const sem9 = digits.slice(0, 2) + digits.slice(3)
    candidates.push(`55${sem9}`)
  } else if (digits.length === 10) {
    // Sem 9º dígito → tenta com: DDD (2) + 9 + número
    const com9 = digits.slice(0, 2) + '9' + digits.slice(2)
    candidates.push(`55${com9}`)
  }

  console.log(`🔍 WhatsApp verificando números: ${candidates.join(', ')}`)

  for (const number of candidates) {
    try {
      const numberId = await client.getNumberId(number)
      if (numberId?._serialized) {
        console.log(`✅ Chat ID confirmado: ${numberId._serialized}`)
        return numberId._serialized
      }
    } catch {
      // continua tentando o próximo
    }
  }

  // Fallback: usa o primeiro candidato sem confirmação
  const fallback = `${candidates[0]}@c.us`
  console.log(`⚠️  Chat ID não verificado, usando fallback: ${fallback}`)
  return fallback
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!client || wsStatus !== 'connected') return false

  try {
    const chatId = await resolveChatId(phone)
    console.log(`📤 WhatsApp → ${chatId}`)
    await client.sendMessage(chatId, message)
    return true
  } catch (err) {
    console.error('Erro ao enviar WhatsApp para', phone, err)
    return false
  }
}

export function getWhatsAppInfo(): { status: WsStatus, qr: string | null } {
  return { status: wsStatus, qr: qrDataUrl }
}
