import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { PizzaSize, Crust, Flavor, Beverage } from '@pizzaria/shared'

// ── Tipos do carrinho ─────────────────────────────────────────────────────────

export interface PizzaCartItem {
  id: string
  tipo: 'PIZZA'
  tamanho: PizzaSize
  borda: Crust
  sabores: Flavor[]
  quantidade: number
  precoUnitario: number
  observacoes?: string
}

export interface BeverageCartItem {
  id: string
  tipo: 'BEBIDA'
  bebida: Beverage
  quantidade: number
  precoUnitario: number
}

export type CartItem = PizzaCartItem | BeverageCartItem

// ── Reducer ───────────────────────────────────────────────────────────────────

type CartAction =
  | { type: 'ADD_PIZZA';    payload: Omit<PizzaCartItem, 'id'> }
  | { type: 'ADD_BEVERAGE'; payload: BeverageCartItem }
  | { type: 'UPDATE_QTY';   id: string; qty: number }
  | { type: 'REMOVE';       id: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE';      items: CartItem[] }

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_PIZZA':
      return [...state, { ...action.payload, id: `pizza-${Date.now()}-${Math.random()}` }]

    case 'ADD_BEVERAGE': {
      // Agrupa bebidas iguais
      const existing = state.find(
        (i) => i.tipo === 'BEBIDA' && i.bebida.id === action.payload.bebida.id,
      ) as BeverageCartItem | undefined
      if (existing) {
        return state.map((i) =>
          i.id === existing.id ? { ...i, quantidade: i.quantidade + action.payload.quantidade } : i,
        )
      }
      return [...state, action.payload]
    }

    case 'UPDATE_QTY':
      if (action.qty <= 0) return state.filter((i) => i.id !== action.id)
      return state.map((i) => (i.id === action.id ? { ...i, quantidade: action.qty } : i))

    case 'REMOVE':
      return state.filter((i) => i.id !== action.id)

    case 'CLEAR':
      return []

    case 'HYDRATE':
      return action.items

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[]
  total: number
  itemCount: number
  addPizza:    (item: Omit<PizzaCartItem, 'id'>) => void
  addBeverage: (item: BeverageCartItem) => void
  updateQty:   (id: string, qty: number) => void
  remove:      (id: string) => void
  clear:       () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_KEY = 'pizzaria_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  // Hidrata do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      if (saved) dispatch({ type: 'HYDRATE', items: JSON.parse(saved) })
    } catch { /* ignore */ }
  }, [])

  // Persiste no localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const total = items.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0)
  const itemCount = items.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <CartContext.Provider value={{
      items, total, itemCount,
      addPizza:    (p) => dispatch({ type: 'ADD_PIZZA', payload: p }),
      addBeverage: (b) => dispatch({ type: 'ADD_BEVERAGE', payload: b }),
      updateQty:   (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty }),
      remove:      (id) => dispatch({ type: 'REMOVE', id }),
      clear:       () => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
