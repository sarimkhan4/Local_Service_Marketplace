# Local Service Management System (LSM)

## Tags
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-262627?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![PrimeNG](https://img.shields.io/badge/PrimeNG-FF6859?style=for-the-badge&logoColor=white)

## Features
Based on the foundational Entity-Relationship constraints, the platform handles end-to-end service orchestration:
- **Role-Based Workflows**: Discrete interfaces and authorizations traversing Customers and Providers (ISA hierarchy from `USER`).
- **Provider Fleet & Service Discovery**: Service mappings linked via Categories. Providers can list their explicit pricing per service (`Provider_Service` pivot).
- **Advanced Bookings**: Full cart and checkout systems mapping Customer addresses, Service details, pricing, and scheduling variables.
- **Provider Scheduling**: Management of granular time slots and calendar availability.
- **Payments**: Transaction tracking linking directly to distinct Bookings and calculating accurate localized totals & tax distributions.
- **Reviews & Ratings**: Post-service feedback looping back to the initial Booking.
- **Asynchronous Notifications**: Real-time broadcast architectures for keeping Providers and Customers informed on state changes (Unread/Read triggers).

## Interactiveness
- **Functional Reactivity**: Uses Angular 21+ Signals (`signal`, `computed`) for blazing-fast state hydration without deep observable chains.
- **Modern Component Shell**: Employs PrimeNG's rich suite to provide complex interfaces (Skeletons, Dialogs, Data Tables, Toast notifications, Tabs, and specialized FileUpload modules).
- **Responsive Architecture**: Flex-box based layout rendering cleanly across mobile to desktop environments.
- **Optimistic UI Updates**: Table paginations, dynamic total recalculations, and visual checkout carts that map smoothly directly from nested backend entity relations.

## Setup

### Prerequisites
- Node.js (v20+)
- MySQL Database 
- Angular CLI

### Backend (NestJS)
```bash
cd backend
npm install
# Ensure you have your MySQL database running and configured in a .env file
npm run start:dev
```

### Frontend (Angular)
```bash
cd frontend
npm install
npm run start
```

## Project Folder Structure
```text
lsm/
├── backend/ # NestJS API System
│   ├── src/
│   │   ├── common/         # Enums & Interfaces (e.g. notification types)
│   │   ├── entities/       # TypeORM Models mirroring ER mapping
│   │   │   ├── user.entity.ts
│   │   │   ├── customer.entity.ts
│   │   │   ├── provider.entity.ts
│   │   │   ├── service.entity.ts
│   │   │   ├── booking.entity.ts
│   │   │   ├── payment.entity.ts
│   │   │   └── ...
│   │   ├── modules/        # Domain-driven feature controllers & services
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── payments/
│   │   │   ├── schedule/
│   │   │   └── ...
│   │   ├── main.ts
│   │   └── app.module.ts
│   └── package.json
└── frontend/ # Angular 21 + PrimeNG Interface
    ├── src/
    │   ├── app/
    │   │   ├── core/       # Singleton services (Auth, Booking, ApiService)
    │   │   ├── features/   # Page-level components
    │   │   │   ├── customer/ # Checkout, Dashboard, Settings
    │   │   │   ├── provider/ # Earnings, Schedule, Reviews
    │   │   │   ├── auth/     # Login, Signup
    │   │   │   └── home/
    │   │   └── layout/     # View Shells (Topbars, Sidebars for roles)
    │   ├── styles.css      # Core styles & PrimeNG overrides
    │   └── main.ts
    ├── angular.json
    └── package.json
```