import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer'
import { config } from './config'

let printer: ThermalPrinter | null = null

function getInterface(): string {
  if (config.printerType === 'network') {
    return `tcp://${config.printerHost}:${config.printerPort}`
  }
  // USB — node-thermal-printer auto-discovers first USB printer when using usb://
  return 'usb://'
}

export async function getPrinter(): Promise<ThermalPrinter> {
  if (!printer) {
    printer = new ThermalPrinter({
      type:         PrinterTypes.EPSON,
      interface:    getInterface(),
      characterSet: CharacterSet.PC858_EURO,
      removeSpecialCharacters: false,
      lineCharacter: '-',
    })
  }
  return printer
}

export async function printText(text: string): Promise<void> {
  const p = await getPrinter()

  const isConnected = await p.isPrinterConnected()
  if (!isConnected) throw new Error('Impressora não encontrada ou offline')

  p.alignLeft()
  p.setTextSize(0, 0)

  for (const line of text.split('\n')) {
    p.println(line)
  }

  p.cut()
  await p.execute()
  p.clear()
}
