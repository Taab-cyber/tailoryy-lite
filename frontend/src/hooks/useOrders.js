// hooks/useOrders.js — React Query hooks for order data
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export function useOrders(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status)       params.append('status',       filters.status)
  if (filters.service_type) params.append('service_type', filters.service_type)
  if (filters.skip)         params.append('skip',         filters.skip)
  if (filters.limit)        params.append('limit',        filters.limit || 20)

  return useQuery({
    queryKey: ['orders', filters],
    queryFn:  () => api.get(`/orders/?${params}`).then(r => r.data),
  })
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['order', id],
    queryFn:  () => api.get(`/orders/${id}`).then(r => r.data),
    enabled:  !!id,
  })
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn:  () => api.get('/orders/stats').then(r => r.data),
    staleTime: 1000 * 60,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/orders/', data).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/orders/${id}/status`, data).then(r => r.data),
    onSuccess:  (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', id] })
    },
  })
}
