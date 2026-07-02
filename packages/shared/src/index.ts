// ── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'CLIENTE' | 'ADMIN'
export type OrderType = 'ENTREGA' | 'RETIRADA'
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CARTAO'
export type OrderStatus =
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'PRONTO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO'
export type ItemType = 'PIZZA' | 'BEBIDA'
export type FlavorCategory = 'SALGADA' | 'DOCE'
export type PrintJobType = 'COZINHA' | 'CAIXA' | 'RELATORIO'
export type PrintJobStatus = 'PENDENTE' | 'IMPRESSO' | 'ERRO'
export type PriceCalcMethod = 'MAIOR_PRECO' | 'MEDIA_PRECO'

// ── Modelos base ─────────────────────────────────────────────────────────────

export interface User {
  id: string
  nome: string
  telefone: string
  papel: Role
  enderecos?: Address[]
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  rua: string
  numero: string
  bairro: string
  complemento?: string
  referencia?: string
  principal?: boolean
  userId: string
}

export interface OrderItemFlavourResponse {
  id: string
  orderItemId: string
  flavorId: string
  flavor: Flavor
}

export interface AddressSnapshot {
  rua: string
  numero: string
  bairro: string
  complemento?: string
  referencia?: string
}

export interface PizzaSize {
  id: string
  nome: string
  preco: number
  pedacos: number
  maxSabores: number
  ordem: number
  ativo: boolean
}

export interface Crust {
  id: string
  nome: string
  preco: number
  ativo: boolean
}

export interface Flavor {
  id: string
  nome: string
  descricao?: string
  preco: number
  categoria: FlavorCategory
  ativo: boolean
  imagemUrl?: string
}

export interface Beverage {
  id: string
  nome: string
  preco: number
  volume?: string
  ativo: boolean
  imagemUrl?: string
}

export interface OrderItem {
  id: string
  orderId: string
  tipo: ItemType
  tamanhoId?: string
  tamanho?: PizzaSize
  bordaId?: string
  borda?: Crust
  sabores: OrderItemFlavourResponse[]
  bebidaId?: string
  bebida?: Beverage
  quantidade: number
  precoUnitario: number
  observacoes?: string
}

export interface Order {
  id: string
  numero: number
  userId: string
  user?: User
  tipo: OrderType
  enderecoEntrega?: AddressSnapshot
  formaPagamento: PaymentMethod
  trocoPara?: number
  status: OrderStatus
  total: number
  itens: OrderItem[]
  printJobs?: PrintJob[]
  createdAt: string
  updatedAt: string
}

export interface PrintJob {
  id: string
  orderId?: string
  tipo: PrintJobType
  status: PrintJobStatus
  tentativas: number
  erro?: string
  /** Conteúdo pré-renderizado (relatórios e impressões avulsas). */
  conteudo?: string
  createdAt: string
  updatedAt: string
}

export interface StoreConfig {
  id: string
  nome: string
  endereco?: string
  telefone?: string
  taxaEntrega: number
  horarioFuncionamento?: string
  calcPrecoSabor: PriceCalcMethod
  updatedAt: string
}

// ── DTOs de autenticação ─────────────────────────────────────────────────────

export interface LoginRequest {
  telefone: string
  senha: string
}

export interface RegisterRequest {
  nome: string
  telefone: string
  senha: string
}

export interface AuthResponse {
  token: string
  user: User
}

// ── DTOs de pedido ───────────────────────────────────────────────────────────

export interface CreateOrderItemRequest {
  tipo: ItemType
  // Pizza
  tamanhoId?: string
  bordaId?: string
  saborIds?: string[]
  // Bebida
  bebidaId?: string
  quantidade: number
  observacoes?: string
}

export interface CreateOrderRequest {
  tipo: OrderType
  enderecoId?: string
  enderecoEntrega?: AddressSnapshot
  formaPagamento: PaymentMethod
  trocoPara?: number
  itens: CreateOrderItemRequest[]
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
}

// ── Eventos WebSocket ─────────────────────────────────────────────────────────

export interface WsNewOrderPayload {
  order: Order
}

export interface WsStatusUpdatePayload {
  orderId: string
  orderNumero: number
  status: OrderStatus
  userId: string
}

export type ServerToClientEvents = {
  'novo-pedido': (payload: WsNewOrderPayload) => void
  'status-atualizado': (payload: WsStatusUpdatePayload) => void
  'print-job': (payload: { jobId: string; orderId?: string; tipo: PrintJobType }) => void
}

export type ClientToServerEvents = {
  'join-order': (orderId: string) => void
  'leave-order': (orderId: string) => void
  'join-admin': () => void
}

// ── Respostas de API ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  details?: Record<string, string[]>
}

export type ApiResult<T> = ApiResponse<T> | ApiError

// ── Helpers ───────────────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em Preparo',
  PRONTO: 'Pronto para Retirada',
  SAIU_PARA_ENTREGA: 'Saiu para Entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO: 'Cartão na Entrega',
}

// ── Relatórios ────────────────────────────────────────────────────────────────

/** Filtros aceitos pelo relatório de vendas (todos opcionais). */
export interface ReportFilters {
  /** Data inicial (YYYY-MM-DD). Default: hoje. */
  from?: string
  /** Data final (YYYY-MM-DD). Default: igual a `from`. */
  to?: string
  /** Lista de status separada por vírgula (ex.: "ENTREGUE,RECEBIDO"). */
  status?: string
  /** Formas de pagamento separadas por vírgula (ex.: "PIX,DINHEIRO"). */
  formaPagamento?: string
  /** Filtra os itens por sabor específico. */
  saborId?: string
  /** Filtra os sabores por categoria. */
  categoria?: FlavorCategory
}

export interface ReportPaymentBreakdown {
  forma: PaymentMethod
  count: number
  total: number
}

export interface ReportStatusBreakdown {
  status: OrderStatus
  count: number
  total: number
}

export interface ReportTopItem {
  nome: string
  count: number
  total: number
}

export interface ReportDailyEntry {
  date: string
  pedidos: number
  faturamento: number
}

export interface SalesReport {
  from: string
  to: string
  totalPedidos: number
  faturamento: number
  ticketMedio: number
  cancelados: { count: number; total: number }
  porPagamento: ReportPaymentBreakdown[]
  porStatus: ReportStatusBreakdown[]
  topSabores: ReportTopItem[]
  topProdutos: ReportTopItem[]
  dailyBreakdown: ReportDailyEntry[]
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'RECEBIDO',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
]

export const ORDER_STATUS_FLOW_RETIRADA: OrderStatus[] = [
  'RECEBIDO',
  'EM_PREPARO',
  'PRONTO',
  'ENTREGUE',
]

export function getNextStatus(tipo: OrderType, status: OrderStatus): OrderStatus | null {
  const flow = tipo === 'RETIRADA' ? ORDER_STATUS_FLOW_RETIRADA : ORDER_STATUS_FLOW
  const idx = flow.indexOf(status)
  if (idx < 0 || idx >= flow.length - 1) return null
  return flow[idx + 1]
}

export function calcularPrecoPizza(
  sabores: { preco: number }[],
  metodo: PriceCalcMethod = 'MAIOR_PRECO'
): number {
  if (sabores.length === 0) return 0
  if (metodo === 'MAIOR_PRECO') {
    return Math.max(...sabores.map((s) => s.preco))
  }
  const soma = sabores.reduce((acc, s) => acc + s.preco, 0)
  return parseFloat((soma / sabores.length).toFixed(2))
}
