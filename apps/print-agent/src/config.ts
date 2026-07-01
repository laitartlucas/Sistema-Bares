import 'dotenv/config'

function required(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Variável de ambiente obrigatória ausente: ${key}`)
  return v
}

export const config = {
  apiUrl:         process.env.API_URL ?? 'http://localhost:3001',
  printSecret:    required('PRINT_SECRET'),
  // Nome do compartilhamento (Windows) de cada impressora local.
  // Ex: painel de controle > impressoras > propriedades > compartilhamento > "COZINHA"
  printerShares: {
    COZINHA:   required('PRINTER_COZINHA'),
    CAIXA:     required('PRINTER_CAIXA'),
    RELATORIO: process.env.PRINTER_RELATORIO ?? process.env.PRINTER_CAIXA ?? required('PRINTER_CAIXA'),
  },
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS ?? '5000'),
  storeName:      process.env.STORE_NAME ?? 'PIZZARIA',
}
