# Salon E-Commerce Platform

A comprehensive e-commerce solution for salon products, featuring separate portals for Customers/Salon Owners and Agents

##  Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd salonshop
    ```

2.  **Start Backend:**
    ```bash
    cd salon_e_com_server
    npm install
    # Create .env file with necessary variables (MONGODB_URI, PORT, JWT_SECRET, etc.) refer to .env.example file
    npm run dev
    ```

3.  **Start Frontend:**
    ```bash
    cd ../Salon_E_Comm
    # configure .env file, refer to .env.example file.
    npm install
    npm run dev
    ```

4.  **Access the Application:**
    -   Frontend: `http://localhost:5173`
    -   Backend API: `http://localhost:5005` (or configured port)

##  Documentation

For detailed information about the system, please refer to:

-   [**API Documentation**](./API_DOCS.md): List of available API endpoints and their purpose.
-   [**System Flow**](./SYSTEM_FLOW.md): detailed explanation of the system architecture and business logic.

##   Key Features

-   **User Roles:** Salon Owners (Customers), Agents, Administrators or Guests.
-   **Product Management:** Categories, Subcategories, Variants, and Inventory Tracking.
-   **Order System:** Cart management, Checkout with Razorpay, and Order Tracking.
-   **Agent System:** Commission tracking, Wallet management, and Referral system.
-   **Rewards:** Salon owners earn points on purchases which can be redeemed for discounts.
