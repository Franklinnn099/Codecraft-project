# Expert Office Furnish - Platform Documentation

> **Version:** 1.0  
> **Date:** December 2024  
> **Prepared for:** Client Review

---

## 📋 Executive Summary

**Expert Office Furnish** is a modern, full-featured e-commerce and business management platform for premium office furniture. The platform consists of two main applications:

1. **Customer-Facing Website** - Where customers browse, shop, and interact with your brand
2. **Admin Dashboard** - Where you manage products, orders, customers, and content

---

## 🏗️ Platform Architecture

```
Expert Office Furnish
├── Customer Website (React + Vite)
│   └── Port: 5001 (development)
├── Admin Dashboard (React + Vite)
│   └── Port: 5000 (development)
├── Backend API (Express.js)
│   └── Port: 5050
└── Database (Supabase)
    └── PostgreSQL + Authentication + Storage
```

---

## 🛒 Customer Website Features

### Home Page
- Hero banner with promotional carousel
- Featured products showcase
- Services overview
- Newsletter subscription
- Quick access to shop categories

### Shop Page
- Product grid with filtering options
- Category-based navigation
- Search functionality
- Price sorting
- Product cards with quick view

### Product Page
- High-quality product images
- Product details and specifications
- Related products recommendations
- Add to cart functionality
- Product reviews and ratings

### Gallery Page
- Visual showcase of office setups
- Interior design inspiration
- Product collections display

### Cart & Checkout
- Shopping cart management
- Quantity adjustments
- Order summary
- Checkout process

### User Account
- **Registration & Login** - Secure authentication via Supabase
- **Profile Management** - Personal details, address, preferences
- **Order History** - View past purchases
- **Password Reset** - Self-service password recovery

### Contact & Inquiries
- Contact form for general inquiries
- Service inquiry submission
- Location information
- Business hours

### Blog
- Article listing with categories
- Full blog post view
- Search and filter articles

### Services
- Office setup consultation
- Interior design services
- Bulk ordering for businesses

### Newsletter
- Email subscription
- Welcome email confirmation
- Updates and promotions

---

## 👨‍💼 Admin Dashboard Features

### Dashboard Overview
- Sales statistics at a glance
- Recent orders summary
- Customer activity metrics
- Quick action buttons

### Product Management
| Feature | Description |
|---------|-------------|
| **Product List** | View, search, filter all products |
| **Add Product** | Create new products with images |
| **Edit Product** | Update product details, pricing, stock |
| **Bulk Import** | Import multiple products via CSV |
| **Upload Images** | Manage product image gallery |
| **Categories** | Organize products by category |

### Order Management
| Feature | Description |
|---------|-------------|
| **Orders List** | View all customer orders |
| **Order Details** | Full order information |
| **Order Status** | Update fulfillment status |
| **Export Orders** | Download order reports |

### Customer Management
| Feature | Description |
|---------|-------------|
| **Customer List** | View all registered customers |
| **Customer Details** | Profile, order history, activity |
| **User Management** | Block/unblock users |

### Content Management
| Feature | Description |
|---------|-------------|
| **Blog Posts** | Create, edit, publish articles |
| **Homepage Banners** | Manage promotional banners |
| **Service Pages** | Update service information |

### Marketing & Communications
| Feature | Description |
|---------|-------------|
| **Newsletter** | Manage subscribers, send campaigns |
| **Discounts** | Create and manage discount codes |
| **Contact Messages** | View and respond to inquiries |
| **Service Inquiries** | Manage business consultation requests |

### Analytics & Reports
| Feature | Description |
|---------|-------------|
| **Analytics Overview** | Traffic, conversion, revenue |
| **Sales Performance** | Revenue charts and trends |
| **Top Products** | Best-selling items |
| **User Behavior** | Customer interaction patterns |
| **Product Reviews** | Customer feedback analysis |

### Admin Management
| Feature | Description |
|---------|-------------|
| **Admin Users** | Manage admin accounts |
| **Roles & Permissions** | Define access levels |
| **Notifications** | System alerts and updates |
| **Admin Profile** | Personal admin settings |

---

## 🔐 Security Features

- **Supabase Authentication** - Industry-standard auth with email/password
- **Row-Level Security (RLS)** - Database-level access control
- **API Key Protection** - Secured backend endpoints
- **CORS Configuration** - Cross-origin request protection
- **Input Validation** - All user inputs are validated
- **Rate Limiting** - Protection against abuse

---

## 📧 Email System

### Welcome Emails
- Personalized greeting with company logo
- Account confirmation
- Quick links to start shopping

### Features
- Gmail SMTP integration via Nodemailer
- HTML-formatted professional templates
- Company branding (logo, colors)
- Automatic sending on registration

---

## 💾 Database Structure

### Core Tables
| Table | Purpose |
|-------|---------|
| `products` | Product catalog |
| `categories` | Product categories |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `customers` | Customer profiles |
| `users` | Admin users |

### Content Tables
| Table | Purpose |
|-------|---------|
| `blog_posts` | Blog articles |
| `banners` | Homepage banners |
| `subscribers` | Newsletter subscribers |

### Engagement Tables
| Table | Purpose |
|-------|---------|
| `contact_messages` | Contact form submissions |
| `service_inquiries` | Business inquiry requests |
| `product_reviews` | Customer reviews |
| `discounts` | Promotional codes |

---

## 🚀 Deployment Options

### Development (Current)
```
Customer Site:  http://localhost:5001
Admin Dashboard: http://localhost:5000
Backend API:     http://localhost:5050
```

### Production (Recommended)
- **Vercel** - Frontend hosting (both apps)
- **Railway/Render** - Backend API hosting
- **Supabase** - Database (already configured)

---

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- ✅ Desktop computers (1920px+)
- ✅ Laptops (1024px - 1919px)
- ✅ Tablets (768px - 1023px)
- ✅ Mobile phones (320px - 767px)

---

## 🎨 Brand Customization

### Colors
- **Primary Green:** `#16a34a` / `#22c55e`
- **Accent Gold:** `#eab308` / `#facc15`
- **Dark Background:** `#1f2937` / `#111827`

### Logo
- Located at: `apps/client-site/src/assets/Company logo.png`
- Used in header, footer, emails, and admin dashboard

---

## 📞 Support & Maintenance

### Included in Delivery
- ✅ Full source code access
- ✅ Database with all tables configured
- ✅ Documentation files
- ✅ Email system setup
- ✅ Authentication system

### Recommended Maintenance
- Regular database backups
- SSL certificate renewal
- Dependency updates (quarterly)
- Security patches as needed

---

## 📚 Quick Start Guide

### For Administrators

1. **Access Admin Dashboard**
   - Go to: `http://localhost:5000` (dev) or your production URL
   - Login with admin credentials

2. **Add Products**
   - Navigate to Products → Add Product
   - Fill in details, upload images
   - Set pricing and stock levels
   - Save and publish

3. **Manage Orders**
   - View incoming orders in Orders section
   - Click order to see details
   - Update status as orders are processed

4. **Create Blog Posts**
   - Go to Content → Blog Posts
   - Click "Create New Post"
   - Add title, content, featured image
   - Publish when ready

### For Customers

1. **Browse Products**
   - Visit homepage or Shop page
   - Filter by category or search
   - Click products for details

2. **Create Account**
   - Click Sign Up
   - Enter email and password
   - Receive welcome email

3. **Make Purchases**
   - Add items to cart
   - Proceed to checkout
   - Complete payment

---

## 🔧 Technical Requirements

### Development
- Node.js 18+
- npm or yarn
- Git

### Production
- Static hosting (Vercel, Netlify)
- Node.js hosting for backend
- Supabase account (included)

---

## 📄 File Structure Overview

```
Expert-office-Furnish-final/
├── apps/
│   ├── client-site/          # Customer website
│   │   ├── src/
│   │   │   ├── pages/        # Page components
│   │   │   ├── components/   # Reusable components
│   │   │   ├── assets/       # Images & static files
│   │   │   └── supabase/     # Database client
│   │   └── package.json
│   │
│   └── admin-dashboard/      # Admin panel
│       ├── src/
│       │   ├── pages/        # Admin pages
│       │   ├── components/   # Admin components
│       │   └── layouts/      # Layout templates
│       └── package.json
│
├── backend/                   # API server
│   ├── routes/               # API endpoints
│   ├── services/             # Business logic
│   ├── middleware/           # Express middleware
│   └── index.js              # Entry point
│
└── supabase/                 # Database
    ├── migrations/           # Schema files
    └── functions/            # Edge functions
```

---

## ✉️ Contact

For technical support or questions about this platform, please contact the development team.

---

*© 2024 Expert Office Furnish. All rights reserved.*
