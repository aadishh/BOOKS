# Entity Relationship Diagram - Bookstore Microservices System

## ER Diagram

```mermaid
erDiagram
    %% Core Entities
    USER {
        ObjectId _id PK
        string username UK
        string email UK
        string password
        enum role "user, admin"
        boolean twoFactorEnabled
        object profile
        boolean isActive
        Date lastLogin
        boolean emailVerified
        string emailVerificationToken
        Date createdAt
        Date updatedAt
    }

    USER_PROFILE {
        string firstName
        string lastName
        string phone
        object address
    }

    BOOK {
        ObjectId _id PK
        string title
        string author
        string isbn UK
        string description
        enum category
        number price
        number discountPrice
        number stock
        array images
        string publisher
        Date publishedDate
        number pages
        string language
        enum format "Hardcover, Paperback, eBook, Audiobook"
        object dimensions
        array reviews
        number averageRating
        number totalReviews
        array tags
        boolean isActive
        boolean isFeatured
        number salesCount
        Date createdAt
        Date updatedAt
    }

    BOOK_REVIEW {
        ObjectId user FK
        number rating
        string comment
        number helpful
        Date createdAt
        Date updatedAt
    }

    BOOK_IMAGE {
        string url
        string alt
        boolean isPrimary
    }

    BOOK_DIMENSIONS {
        number length
        number width
        number height
        number weight
    }

    CATEGORY {
        ObjectId _id PK
        string name UK
        string slug UK
        string description
        object image
        ObjectId parent FK
        array children
        boolean isActive
        number sortOrder
        number bookCount
        string metaTitle
        string metaDescription
        array metaKeywords
        Date createdAt
        Date updatedAt
    }

    CART {
        ObjectId _id PK
        ObjectId user FK UK
        array items
        number subtotal
        number totalItems
        Date lastModified
        Date createdAt
        Date updatedAt
    }

    CART_ITEM {
        ObjectId book FK
        number quantity
        number price
        number discountPrice
        Date createdAt
        Date updatedAt
    }

    ORDER {
        ObjectId _id PK
        ObjectId user FK
        string orderNumber UK
        array items
        number subtotal
        number tax
        number shipping
        number discount
        number total
        enum status "pending, confirmed, processing, shipped, delivered, cancelled, refunded"
        enum paymentStatus "pending, paid, failed, refunded"
        enum paymentMethod "credit_card, debit_card, paypal, stripe, cash_on_delivery"
        object paymentDetails
        object shippingAddress
        object billingAddress
        enum shippingMethod "standard, express, overnight, pickup"
        string trackingNumber
        Date estimatedDelivery
        Date actualDelivery
        string notes
        number refundAmount
        string refundReason
        string cancelReason
        Date createdAt
        Date updatedAt
    }

    ORDER_ITEM {
        ObjectId book FK
        number quantity
        number price
        number discountPrice
    }

    SHIPPING_ADDRESS {
        string firstName
        string lastName
        string street
        string city
        string state
        string zipCode
        string country
        string phone
    }

    PAYMENT_DETAILS {
        string transactionId
        string paymentGateway
        string last4
        string cardType
    }

    %% Microservice Entities (Orders-Payments Service)
    USER_CART_MS {
        string userId PK
        array items
        Date updatedAt
    }

    CART_ITEM_MS {
        string id PK
        string bookId FK
        string name
        number price
        number quantity
        Date addedAt
    }

    USER_WISHLIST {
        string userId PK
        array items
        Date updatedAt
    }

    WISHLIST_ITEM {
        string id PK
        string bookId FK
        string name
        number price
        Date addedAt
    }

    ORDER_MS {
        string id PK
        string userId FK
        array items
        number total
        string customerEmail
        object shippingAddress
        string paymentMethod
        enum status "pending, confirmed, cancelled"
        string paymentId FK
        Date createdAt
    }

    PAYMENT {
        string id PK
        string orderId FK
        number amount
        string paymentMethod
        enum status "processing, completed, failed"
        string transactionId
        Date createdAt
        Date processedAt
    }

    %% Microservice Entities (Product Details Service)
    BOOK_MS {
        string id PK
        string name
        string author
        string category
        number price
        number stock
        string description
        string isbn
        number pages
        string publisher
        string publishedDate
        number rating
        number reviews
        array tags
        Date createdAt
        Date updatedAt
    }

    %% Microservice Entities (Shipping Service)
    SHIPMENT {
        string id PK
        string orderId FK
        string customerEmail
        object shippingAddress
        array items
        enum shippingMethod "standard, priority, express"
        enum status "pending, processing, shipped, in_transit, out_for_delivery, delivered, exception"
        string trackingNumber UK
        Date estimatedDelivery
        Date deliveredAt
        string deliveredTo
        string signature
        string deliveryPhoto
        Date createdAt
        Date updatedAt
    }

    SHIPMENT_ITEM {
        string id
        string name
        number quantity
        number price
    }

    TRACKING_EVENT {
        string id PK
        string shipmentId FK
        enum status
        string description
        string location
        Date timestamp
    }

    %% Relationships
    USER ||--o{ USER_PROFILE : has
    USER ||--o{ BOOK_REVIEW : writes
    USER ||--o| CART : owns
    USER ||--o{ ORDER : places

    BOOK ||--o{ BOOK_REVIEW : receives
    BOOK ||--o{ BOOK_IMAGE : has
    BOOK ||--o| BOOK_DIMENSIONS : has
    BOOK ||--o{ CART_ITEM : "added to"
    BOOK ||--o{ ORDER_ITEM : "ordered as"

    CATEGORY ||--o{ CATEGORY : "parent of"
    CATEGORY ||--o{ BOOK : categorizes

    CART ||--o{ CART_ITEM : contains
    CART_ITEM }o--|| BOOK : references

    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--|| SHIPPING_ADDRESS : "ships to"
    ORDER ||--o| PAYMENT_DETAILS : "paid with"
    ORDER_ITEM }o--|| BOOK : references

    %% Microservice Relationships
    USER_CART_MS ||--o{ CART_ITEM_MS : contains
    USER_WISHLIST ||--o{ WISHLIST_ITEM : contains
    
    ORDER_MS ||--o{ CART_ITEM_MS : contains
    ORDER_MS ||--o| PAYMENT : "paid by"
    
    SHIPMENT ||--o{ SHIPMENT_ITEM : contains
    SHIPMENT ||--o{ TRACKING_EVENT : tracks
    ORDER_MS ||--o| SHIPMENT : "shipped as"

    %% Cross-service relationships (via IDs)
    CART_ITEM_MS }o--|| BOOK_MS : references
    WISHLIST_ITEM }o--|| BOOK_MS : references
    SHIPMENT }o--|| ORDER_MS : ships
```

## Entity Descriptions

### Core Database Entities (API Gateway)

#### USER
- Primary entity for user authentication and profile management
- Supports role-based access control (user/admin)
- Includes 2FA support and email verification
- Contains embedded profile information

#### BOOK
- Central product entity with comprehensive book information
- Includes pricing, inventory, and metadata
- Supports reviews, ratings, and categorization
- Contains embedded images and dimensions

#### CATEGORY
- Hierarchical categorization system
- Self-referencing for parent-child relationships
- Includes SEO metadata

#### CART
- User-specific shopping cart
- Contains embedded cart items
- Tracks totals and modification timestamps

#### ORDER
- Complete order information with items and addresses
- Supports multiple payment methods and statuses
- Includes shipping and billing addresses
- Tracks order lifecycle from creation to delivery

### Microservice Entities

#### Orders-Payments Service
- **USER_CART_MS**: Simplified cart for microservice operations
- **USER_WISHLIST**: Wishlist functionality
- **ORDER_MS**: Order processing and management
- **PAYMENT**: Payment processing and tracking

#### Product Details Service
- **BOOK_MS**: Simplified book entity for product operations
- Handles search, filtering, and inventory management

#### Shipping Service
- **SHIPMENT**: Shipping and delivery tracking
- **TRACKING_EVENT**: Detailed tracking history
- Supports multiple shipping methods and statuses

## Key Relationships

1. **User-Centric**: Users are central to cart, orders, and reviews
2. **Product-Centric**: Books are referenced across all services
3. **Order Flow**: Cart → Order → Payment → Shipment → Delivery
4. **Cross-Service**: Services communicate via shared IDs and API calls
5. **Hierarchical**: Categories support nested structures

## Data Consistency Notes

- The system uses eventual consistency between microservices
- User and Book data is replicated across services as needed
- Order IDs link orders to shipments across service boundaries
- API Gateway maintains authoritative user and book data