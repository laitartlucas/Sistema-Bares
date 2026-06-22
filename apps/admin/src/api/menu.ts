import { api } from './client'
import type { PizzaSize, Crust, Flavor, Beverage } from '@pizzaria/shared'

export const adminMenuApi = {
  // Tamanhos
  listSizes:    ()                  => api.get<PizzaSize[]>('/admin/menu/sizes'),
  createSize:   (d: Partial<PizzaSize>) => api.post<PizzaSize>('/admin/menu/sizes', d),
  updateSize:   (id: string, d: Partial<PizzaSize>) => api.put<PizzaSize>(`/admin/menu/sizes/${id}`, d),
  toggleSize:   (id: string)        => api.patch<PizzaSize>(`/admin/menu/sizes/${id}/toggle`),
  deleteSize:   (id: string)        => api.delete<null>(`/admin/menu/sizes/${id}`),

  // Bordas
  listCrusts:   ()                  => api.get<Crust[]>('/admin/menu/crusts'),
  createCrust:  (d: Partial<Crust>) => api.post<Crust>('/admin/menu/crusts', d),
  updateCrust:  (id: string, d: Partial<Crust>) => api.put<Crust>(`/admin/menu/crusts/${id}`, d),
  toggleCrust:  (id: string)        => api.patch<Crust>(`/admin/menu/crusts/${id}/toggle`),
  deleteCrust:  (id: string)        => api.delete<null>(`/admin/menu/crusts/${id}`),

  // Sabores
  listFlavors:  (cat?: string)      => api.get<Flavor[]>(`/admin/menu/flavors${cat ? `?categoria=${cat}` : ''}`),
  createFlavor: (d: Partial<Flavor>) => api.post<Flavor>('/admin/menu/flavors', d),
  updateFlavor: (id: string, d: Partial<Flavor>) => api.put<Flavor>(`/admin/menu/flavors/${id}`, d),
  toggleFlavor: (id: string)        => api.patch<Flavor>(`/admin/menu/flavors/${id}/toggle`),
  deleteFlavor: (id: string)        => api.delete<null>(`/admin/menu/flavors/${id}`),

  // Bebidas
  listBeverages:   ()               => api.get<Beverage[]>('/admin/menu/beverages'),
  createBeverage:  (d: Partial<Beverage>) => api.post<Beverage>('/admin/menu/beverages', d),
  updateBeverage:  (id: string, d: Partial<Beverage>) => api.put<Beverage>(`/admin/menu/beverages/${id}`, d),
  toggleBeverage:  (id: string)     => api.patch<Beverage>(`/admin/menu/beverages/${id}/toggle`),
  deleteBeverage:  (id: string)     => api.delete<null>(`/admin/menu/beverages/${id}`),
}
