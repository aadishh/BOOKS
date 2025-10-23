"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("./utils/response");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 2002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let shipments = [];
let trackingEvents = [];
const SHIPPING_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    IN_TRANSIT: 'in_transit',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    EXCEPTION: 'exception'
};
app.post('/shipments', (req, res) => {
    const { orderId, customerEmail, shippingAddress, items, shippingMethod = 'standard' } = req.body;
    const shipment = {
        id: (0, uuid_1.v4)(),
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
    addTrackingEvent(shipment.id, SHIPPING_STATUSES.PENDING, 'Shipment created');
    setTimeout(() => updateShipmentStatus(shipment.id, SHIPPING_STATUSES.PROCESSING), 5000);
    response_1.ResponseHandler.created(res, { shipment }, 'Shipment created successfully');
});
app.get('/shipments', (req, res) => {
    response_1.ResponseHandler.success(res, { shipments }, 'Shipments retrieved successfully');
});
app.get('/shipments/:id', (req, res) => {
    const { id } = req.params;
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) {
        response_1.ResponseHandler.notFound(res, 'Shipment not found');
        return;
    }
    const events = trackingEvents.filter(e => e.shipmentId === id);
    response_1.ResponseHandler.success(res, { shipment, trackingEvents: events }, 'Shipment retrieved successfully');
});
app.get('/track/:trackingNumber', (req, res) => {
    const { trackingNumber } = req.params;
    const shipment = shipments.find(s => s.trackingNumber === trackingNumber);
    if (!shipment) {
        response_1.ResponseHandler.notFound(res, 'Tracking number not found');
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
    response_1.ResponseHandler.success(res, trackingData, 'Tracking information retrieved successfully');
});
app.put('/shipments/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, location, notes } = req.body;
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) {
        response_1.ResponseHandler.notFound(res, 'Shipment not found');
        return;
    }
    updateShipmentStatus(id, status, location, notes);
    response_1.ResponseHandler.success(res, { shipment }, 'Shipment status updated successfully');
});
app.post('/shipments/:id/deliver', (req, res) => {
    const { id } = req.params;
    const { deliveredTo, signature, photo } = req.body;
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) {
        response_1.ResponseHandler.notFound(res, 'Shipment not found');
        return;
    }
    shipment.status = SHIPPING_STATUSES.DELIVERED;
    shipment.deliveredAt = new Date();
    shipment.deliveredTo = deliveredTo;
    shipment.signature = signature;
    shipment.deliveryPhoto = photo;
    shipment.updatedAt = new Date();
    addTrackingEvent(id, SHIPPING_STATUSES.DELIVERED, `Delivered to ${deliveredTo}`);
    response_1.ResponseHandler.success(res, { shipment }, 'Delivery confirmed successfully');
});
app.get('/shipments/:id/tracking', (req, res) => {
    const { id } = req.params;
    const events = trackingEvents.filter(e => e.shipmentId === id);
    response_1.ResponseHandler.success(res, { trackingEvents: events }, 'Tracking events retrieved successfully');
});
app.post('/shipments/bulk-update', (req, res) => {
    const { updates } = req.body;
    const results = updates.map(update => {
        const shipment = shipments.find(s => s.trackingNumber === update.trackingNumber);
        if (shipment) {
            updateShipmentStatus(shipment.id, update.status, update.location, update.notes);
            return { trackingNumber: update.trackingNumber, success: true };
        }
        return { trackingNumber: update.trackingNumber, success: false, error: 'Shipment not found' };
    });
    response_1.ResponseHandler.success(res, { results }, 'Bulk update completed');
});
function generateTrackingNumber() {
    const prefix = 'TRK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}
function calculateEstimatedDelivery(shippingMethod) {
    const now = new Date();
    let days;
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
function addTrackingEvent(shipmentId, status, description, location) {
    const event = {
        id: (0, uuid_1.v4)(),
        shipmentId,
        status,
        description,
        location: location || undefined,
        timestamp: new Date()
    };
    trackingEvents.push(event);
    return event;
}
function updateShipmentStatus(shipmentId, status, location, notes) {
    const shipment = shipments.find(s => s.id === shipmentId);
    if (!shipment)
        return null;
    shipment.status = status;
    shipment.updatedAt = new Date();
    let description = getStatusDescription(status);
    if (notes) {
        description += ` - ${notes}`;
    }
    addTrackingEvent(shipmentId, status, description, location);
    if (status === SHIPPING_STATUSES.PROCESSING) {
        setTimeout(() => updateShipmentStatus(shipmentId, SHIPPING_STATUSES.SHIPPED), 10000);
    }
    else if (status === SHIPPING_STATUSES.SHIPPED) {
        setTimeout(() => updateShipmentStatus(shipmentId, SHIPPING_STATUSES.IN_TRANSIT), 15000);
    }
    else if (status === SHIPPING_STATUSES.IN_TRANSIT) {
        setTimeout(() => updateShipmentStatus(shipmentId, SHIPPING_STATUSES.OUT_FOR_DELIVERY), 20000);
    }
    return shipment;
}
function getStatusDescription(status) {
    const descriptions = {
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
app.get('/health', (req, res) => {
    const healthData = {
        status: 'Shipping service is running',
        timestamp: new Date().toISOString(),
        stats: {
            totalShipments: shipments.length,
            totalTrackingEvents: trackingEvents.length,
            statusBreakdown: getStatusBreakdown()
        }
    };
    response_1.ResponseHandler.success(res, healthData, 'Health check successful');
});
function getStatusBreakdown() {
    const breakdown = {
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
//# sourceMappingURL=server.js.map