# System Flow & Architecture

This document explains the high-level architecture and flow of the Salon E-Commerce platform.

## 1. System Components

The system consists of three main user roles interacting with the platform:

1.  **Salon Owner (Customer):** Browses products, places orders, earns rewards.
2.  **Agent:** Onboards salons, earns commission on assigned salon orders.
3.  **Admin:** Manages catalogue, orders, agents, and commissions.

## 2. Key Workflows

### A. Ordering Process (Salon Owner)
1.  **Browse & Cart:** User adds products to cart. Prices shown are "Professional Pricing".
2.  **Checkout:**
    -   User selects shipping address.
    -   **Reward Redemption:** If user has available points and meets criteria (min 3 items), they can redeem points for a discount.
    -   **Agent Attribution:** System automatically links order to an Agent if:
        -   User was referred by an Agent.
        -   Agent is manually assigned to the user profile.
3.  **Payment:** Integrated with Razorpay. Order created as 'UNPAID', then updated to 'PAID' upon successful webhook/verification.
4.  **Completion:** Order status updates to 'DELIVERED'.
    -   **Points Earned:** User earns reward points (locked status).
    -   **Commission Pending:** Agent earns commission (pending status).
5.  **Post-Completion:** Order status manually/auto updated to 'COMPLETED'.
    -   **Points Unlock:** User's reward points become unlocked after return period (simulated).
    -   **Commission Available:** Agent's commission moves to available wallet.

### B. Product Management (Admin)
1.  **Categories:** Nested structure (Category -> Subcategory).
2.  **Products:** Linked to leaf categories. Supports variants (sizes/colors) and multiple images.
3.  **Inventory:** Stock level tracked. Decrements on order creation.

### C. Agent Commission Logic
1.  **Commission Calculation:** Based on order subtotal and defined slabs (e.g., 5-10%).
2.  **Wallet System:** Internal ledger system tracking `Pending` vs `Available` balance.
3.  **Payouts:** Agent requests payout -> Admin approves -> External transfer (manual) -> Admin marks request as 'COMPLETED'.

## 3. Technology Stack

-   **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Context API.
-   **Backend:** Node.js, Express.js.
-   **Database:** MongoDB (Mongoose ORM).
-   **Authentication:** JWT (JSON Web Tokens).
-   **Payment Gateway:** Razorpay.
