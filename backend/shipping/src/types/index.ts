export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ShipmentItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: ShipmentItem[];
  shippingMethod: 'standard' | 'priority' | 'express';
  status: ShippingStatus;
  trackingNumber: string;
  estimatedDelivery: Date;
  deliveredAt?: Date;
  deliveredTo?: string;
  signature?: string;
  deliveryPhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShippingStatus;
  description: string;
  location?: string;
  timestamp: Date;
}

export type ShippingStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception';

export interface StatusUpdate {
  trackingNumber: string;
  status: ShippingStatus;
  location?: string;
  notes?: string;
}

export interface DeliveryConfirmation {
  deliveredTo: string;
  signature?: string;
  photo?: string;
}

export interface BulkUpdateRequest {
  updates: StatusUpdate[];
}

export interface BulkUpdateResult {
  trackingNumber: string;
  success: boolean;
  error?: string;
}