import { apiClient } from './api';
import {
  Shipment,
  TrackingInfo,
  Address,
  ShipmentItem,
} from '@/types';

export const shippingApi = {
  // Create shipment
  createShipment: async (data: {
    orderId: string;
    customerEmail: string;
    shippingAddress: Address;
    items: ShipmentItem[];
    shippingMethod: 'standard' | 'priority' | 'express';
  }): Promise<{ shipment: Shipment }> => {
    return apiClient.post<{ shipment: Shipment }>('/api/shipping/shipments', data);
  },

  // Track shipment
  trackShipment: async (trackingNumber: string): Promise<TrackingInfo> => {
    return apiClient.get<TrackingInfo>(`/api/shipping/track/${trackingNumber}`);
  },

  // Update shipment status (Admin only)
  updateShipmentStatus: async (
    shipmentId: string,
    data: {
      status: string;
      location?: string;
      notes?: string;
    }
  ): Promise<{ shipment: Shipment }> => {
    return apiClient.put<{ shipment: Shipment }>(`/api/shipping/shipments/${shipmentId}/status`, data);
  },

  // Get all shipments (Admin only)
  getShipments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    shipments: Shipment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const url = `/api/shipping/shipments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(url);
  },

  // Get shipment by ID
  getShipment: async (shipmentId: string): Promise<{ shipment: Shipment }> => {
    return apiClient.get<{ shipment: Shipment }>(`/api/shipping/shipments/${shipmentId}`);
  },

  // Health check
  healthCheck: async (): Promise<any> => {
    return apiClient.get('/api/shipping/health');
  },
};