import 'dotenv/config'

function required(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Variável de ambiente obrigatória ausente: ${key}`)
  return v
}

export const config = {
  apiUrl:         process.env.API_URL ?? 'http://localhost:3001',
  printSecret:    required('PRINT_SECRET'),
  printerType:    (process.env.PRINTER_TYPE ?? 'usb') as 'usb' | 'network' | 'serial',
  printerHost:    process.env.PRINTER_HOST ?? '192.168.1.100',
  printerPort:    parseInt(process.env.PRINTER_PORT ?? '9100'),
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS ?? '5000'),
  storeName:      process.env.STORE_NAME ?? 'PIZZARIA',
}
