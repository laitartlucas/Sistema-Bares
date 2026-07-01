import os from 'os'
import path from 'path'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer'
import type { PrintJobType } from '@pizzaria/shared'
import { config } from './config'

const execAsync = promisify(exec)

/**
 * Gera o buffer ESC/POS (texto, corte etc.) sem enviar a nenhuma interface —
 * o transporte real é feito à parte, via compartilhamento de impressora do Windows.
 */
function buildTicketBuffer(text: string): Buffer {
  const p = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'ticket-buffer', // não utilizada para envio, só para satisfazer a lib
    characterSet: CharacterSet.PC858_EURO,
    removeSpecialCharacters: false,
    lineCharacter: '-',
  })

  p.alignLeft()
  p.setTextSize(0, 0)
  for (const line of text.split('\n')) p.println(line)
  p.cut()

  return p.getBuffer()
}

function shareFor(tipo: PrintJobType): string {
  const share = config.printerShares[tipo]
  if (!share) throw new Error(`Nenhuma impressora configurada para jobs do tipo "${tipo}"`)
  return share
}

/**
 * Envia o buffer diretamente ao spool de impressão local via UNC do
 * compartilhamento (\\<computador>\<NomeCompartilhado>), preservando os
 * bytes crus (ESC/POS) — sem precisar de módulos nativos.
 */
async function sendToWindowsPrinterShare(buffer: Buffer, shareName: string): Promise<void> {
  const target = `\\\\${os.hostname()}\\${shareName}`
  const tmpFile = path.join(os.tmpdir(), `ticket-${Date.now()}-${Math.random().toString(36).slice(2)}.prn`)

  await fs.writeFile(tmpFile, buffer)
  try {
    await execAsync(`copy /b "${tmpFile}" "${target}"`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Falha ao enviar para a impressora "${shareName}" (${target}): ${msg}`)
  } finally {
    await fs.unlink(tmpFile).catch(() => {})
  }
}

export async function printText(text: string, tipo: PrintJobType): Promise<void> {
  const buffer = buildTicketBuffer(text)
  const share = shareFor(tipo)
  await sendToWindowsPrinterShare(buffer, share)
}
