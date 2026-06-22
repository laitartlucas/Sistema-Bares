import { api } from './client'
import type { PizzaSize, Crust, Flavor, Beverage, StoreConfig } from '@pizzaria/shared'

export const menuApi = {
  getSizes:     ()                    => api.get<PizzaSize[]>('/menu/sizes'),
  getCrusts:    ()                    => api.get<Crust[]>('/menu/crusts'),
  getFlavors:   (categoria?: string)  =>
    api.get<Flavor[]>(`/menu/flavors${categoria ? `?categoria=${categoria}` : ''}`),
  getBeverages: ()                    => api.get<Beverage[]>('/menu/beverages'),
  getConfig:    ()                    => api.get<StoreConfig | null>('/menu/config'),
}
