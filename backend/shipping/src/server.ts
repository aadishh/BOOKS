import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { 
  Shipment, 
  TrackingEvent, 
  ShippingStatus, 
  StatusUpdate, 
  DeliveryConfirmation,
  BulkUpdateRequest,
  BulkUpdateResult,
  ShippingAddress,
  ShipmentItem
} from './types';
import { ResponseHandler } from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2002;

app.use(cors());
app.use(express.json());

// Mock databases
let shipments: Shipment[] = [];
let trackingEvents: TrackingEvent[] = [];

// Shipping statuses
const SHIPPING_STATUSES: Record<string, ShippingStatus> = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  EXCEPTION: 'exception'
};

// Create shipment
app.post('/shipments', (req: Request, res: Response) => {
  const { 
    orderId, 
    customerEmail, 
    shippingAddress, 
    items, 
    shippingMethod = 'standard' 
  }: {
    orderId: string;
    customerEmail: string;
    shippingAddress: ShippingAddress;
    items: ShipmentItem[];
    shippingMethod?: 'standard' | 'priority' | 'express';
  } = req.body;
  
  const shipment: Shipment = {
    id: uuidv4(),
    orderId,
    customerEmail,
    shippingAddress,
    items,
    shippingMethod,
    status: SHIPPING_STATUSES.PENDING,
    trackingNumber: generateTrackingNumber(),
    estimatedDelivery: calculateEstimatedDelivery(shippingMethod),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  shipments.push(shipment);
  
  // Add initial tracking event
  addTrackingEvent(shipment.id, SHIPPING_STATUSES.PENDING, 'Shipment created');
  
  // Auto-progress shipment status
  setTimeout(() => updateShipmentStatus(shipment.id, SHIPPING_STATUSES.PROCESSING), 5000);
  
  ResponseHandler.created(res, { shipment }, 'Shipment created successfully');
});

// Get all shipments
app.get('/shipments', (req: Request, res: Response) => {
  ResponseHandler.success(res, { shipments }, 'Shipments retrieved successfully');
});

// Get shipment by ID
app.get('/shipments/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const shipment = shipments.find(s => s.id === id);
  
  if (!shipment) {
    ResponseHandler.notFound(res, 'Shipment not found');
    return;
  }
  
  const events = trackingEvents.filter(e => e.shipmentId === id);
  
  ResponseHandler.success(res, { shipment, trackingEvents: events }, 'Shipment retrieved successfully');
});

// Track by tracking number
app.get('/track/:trackingNumber', (req: Request, res: Response): void => {
  const { trackingNumber } = req.params;
  const shipment = shipments.find(s => s.trackingNumber === trackingNumber);
  
  if (!shipment) {
    ResponseHandler.notFound(res, 'Tracking number not found');
    return;
  }
  
  const events = trackingEvents.filter(e => e.shipmentId === shipment.id);
  
  const trackingData = { 
    trackingNumber,
    status: shipment.status,
    estimatedDelivery: shipment.estimatedDelivery,
    shippingAddress: shipment.shippingAddress,
    trackingEvents: events
  };
  ResponseHandler.success(res, trackingData, 'Tracking information retrieved successfully');
});

// Update shipment status
app.put('/shipments/:id/status', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status, location, notes }: StatusUpdate = req.body;
  
  const shipment = shipments.find(s => s.id === id);
  if (!shipment) {
    ResponseHandler.notFound(res, 'Shipment not found');
    return;
  }
  
  updateShipmentStatus(id, status, location, notes);
  
  ResponseHandler.success(res, { shipment }, 'Shipment status updated successfully');
});

// Confirm delivery
app.post('/shipments/:id/deliver', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { deliveredTo, signature, photo }: DeliveryConfirmation = req.body;
  
  const shipment = shipments.find(s => s.id === id);
  if (!shipment) {
    ResponseHandler.notFound(res, 'Shipment not found');
    return;
  }
  
  shipment.status = SHIPPING_STATUSES.DELIVERED;
  shipment.deliveredAt = new Date();
  shipment.deliveredTo = deliveredTo;
  shipment.signature = signature;
  shipment.deliveryPhoto = photo;
  shipment.updatedAt = new Date();
  
  addTrackingEvent(id, SHIPPING_STATUSES.DELIVERED, `Delivered to ${deliveredTo}`);
  
  ResponseHandler.success(res, { shipment }, 'Delivery confirmed successfully');
});

// Get tracking events for a shipment
app.get('/shipments/:id/tracking', (req: Request, res: Response) => {
  const { id } = req.params;
  const events = trackingEvents.filter(e => e.shipmentId === id);
  
  ResponseHandler.success(res, { trackingEvents: events }, 'Tracking events retrieved successfully');
});

// Bulk status update (for carrier integration)
app.post('/shipments/bulk-update', (req: Request, res: Response) => {
  const { updates }: BulkUpdateRequest = req.body;
  
  const results: BulkUpdateResult[] = updates.map(update => {
    const shipment = shipments.find(s => s.trackingNumber === update.trackingNumber);
    if (shipment) {
      updateShipmentStatus(shipment.id, update.status, update.location, update.notes);
      return { trackingNumber: update.trackingNumber, success: true };
    }
    return { trackingNumber: update.trackingNumber, success: false, error: 'Shipment not found' };
  });
  
  ResponseHandler.success(res, { results }, 'Bulk update completed');
});

// Helper functions
function generateTrackingNumber(): string {
  const prefix = 'TRK';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

function calculateEstimatedDelivery(shippingMethod: 'standard' | 'priority' | 'express'): Date {
  const now = new Date();
  let days: number;
  
  switch (shippingMethod) {
    case 'express':
      days = 1;
      break;
    case 'priority':
      days = 2;
      break;
    case 'standard':
    default:
      days = 5;
      break;
  }
  
  const deliveryDate = new Date(now);
  deliveryDate.setDate(now.getDate() + days);
  return deliveryDate;
}

function addTrackingEvent(
  shipmentId: string, 
  status: ShippingStatus, 
  description: string, 
  location?: string
): TrackingEvent {
  const event: TrackingEvent = {
    id: uuidv4(),
    shipmentId,
    status,
    description,
    location: location || undefined,
    timestamp: new Date()
  };
  
  trackingEvents.push(event);
  return event;
}

function updateShipmentStatus(
  shipmentId: string, 
  status: ShippingStatus, 
  location?: string, 
  notes?: string
): Shipment | null {
  const shipment = shipments.find(s => s.id === shipmentId);
  if (!shipment) return null;
  
  shipment.status = status;
  shipment.updatedAt = new Date();
  
  let description = getStatusDescription(status);
  if (notes) {
    description += ` - ${notes}`;
  }
  
  addTrackingEvent(shipmentId, status, description, location);
  
  // Auto-progress to next status (simulation)
  if (status === SHIPPING_STATUSES.PROCESSING) {
    setTimeout(() => updateShipmentStatus(shipmentId, SHIPPING_STATUSES.SHIPPED), 10000);
  } else if (status === SHIPPING_STATUSES.SHIPPED) {
    setTimeout(() => updateShipmentStatus(shipmentId, SHIPPING_STATUSES.IN_TRANSIT), 15000);
  } else if (status === SHIPPING_STATUSES.IN_TRANSIT) {
    setTimeout(() => updateShipmentStatus(shipmentId, SHIPPING_STATUSES.OUT_FOR_DELIVERY), 20000);
  }
  
  return shipment;
}

function getStatusDescription(status: ShippingStatus): string {
  const descriptions: Record<ShippingStatus, string> = {
    pending: 'Shipment created and pending processing',
    processing: 'Order is being prepared for shipment',
    shipped: 'Package has been shipped',
    in_transit: 'Package is in transit',
    out_for_delivery: 'Package is out for delivery',
    delivered: 'Package has been delivered',
    exception: 'Delivery exception occurred'
  };
  
  return descriptions[status] || 'Status updated';
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  const healthData = { 
    status: 'Shipping service is running', 
    timestamp: new Date().toISOString(),
    stats: {
      totalShipments: shipments.length,
      totalTrackingEvents: trackingEvents.length,
      statusBreakdown: getStatusBreakdown()
    }
  };
  ResponseHandler.success(res, healthData, 'Health check successful');
});

function getStatusBreakdown(): Record<ShippingStatus, number> {
  const breakdown: Record<ShippingStatus, number> = {
    pending: 0,
    processing: 0,
    shipped: 0,
    in_transit: 0,
    out_for_delivery: 0,
    delivered: 0,
    exception: 0
  };
  
  Object.values(SHIPPING_STATUSES).forEach(status => {
    breakdown[status] = shipments.filter(s => s.status === status).length;
  });
  
  return breakdown;
}

app.listen(PORT, () => {
  console.log(`Shipping service running on port ${PORT}`);
});