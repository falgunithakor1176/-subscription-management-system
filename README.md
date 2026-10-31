# Brightloop — Software Subscription Management System

Brightloop is a web-based Software Subscription Management System designed to simplify customer management, product management, subscription plan configuration, and subscription-related business operations through a centralized platform.

The system provides role-based access for administrators, staff members, and customers, with a modular architecture designed for future expansion.

## Current Project Features

### 1. Authentication & User Management
- User registration and login.
- Authentication and session management.
- Role-based access control.
- Admin and staff user management.

### 2. Customer Management
- Create, view, update, and delete customer records.
- Search and manage customer information.
- View individual customer details.

### 3. Product Management
- Create and manage products.
- Edit product information.
- Manage product variants.
- View product details and product listings.

### 4. Subscription Plan Management
- Create and manage subscription plans.
- Configure plan pricing and billing cycles.
- Manage plan features and availability.

### 5. Quotation Management
- Manage customer quotations.
- Select products and configure quotation details.
- Calculate quotation amounts.
- Track quotation status.

### 6. Subscription Management
- Manage customer subscriptions.
- Track subscription details and status.
- Support subscription lifecycle operations.

*Only the modules and functionality currently implemented are represented above. Other planned modules are not claimed as completed.*

## User Roles

| Role | Access |
|---|---|
| ADMIN | Overall system administration and management |
| STAFF | Operational access according to assigned permissions |
| CUSTOMER | Access to their own permitted account information |

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js
- JavaScript ES Modules

### Database & ORM
- PostgreSQL
- Prisma ORM

### Development Tools
- Git & GitHub
- Visual Studio Code
- Postman / API testing tools

## Project Architecture

The project follows a modular frontend and backend architecture.

```text
brightloop/
│
├── client/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── layouts/
│       └── modules/
│
├── server/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       └── app.js
│
└── README.md
```

## Project Goals

- Centralize subscription-related business operations.
- Simplify customer and product management.
- Organize subscription plans and quotations.
- Provide role-based access to system functionality.
- Build a scalable foundation for subscription management.

## Future Enhancements

The following modules are planned for future development:

- Discount Management
- Tax Management
- Invoice Management
- Payment Management
- Finance Dashboard and Reports
- Customer Portal

## Development Status

Brightloop is currently under active development. Core modules are being implemented incrementally, with additional functionality planned for subsequent development phases.# subscription-management-system
Full-stack Subscription Management System using React, Node.js and PostgreSQL
