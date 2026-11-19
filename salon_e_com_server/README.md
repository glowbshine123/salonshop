# Salon E-Commerce Backend

## Getting Started

Follow these steps to set up and run the backend server locally.

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas URI)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_folder>
    ```

2.  **Environment Setup:**
    - Copy the example environment file to a new `.env` file.
    - Fill in your specific configuration values (Port, MongoDB URI, JWT Secret, etc.).
    ```bash
    cp .env.example .env
    # Or manually create .env and add variables
    ```
    
    **Example .env:**
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:6969/salon_db
    JWT_SECRET=your_secret_key
    NODE_ENV=development
    RAZORPAY_KEY_ID=rzp_test_SBf8zUuoyO0ajS  # razorpay test key_id
    RAZORPAY_KEY_SECRET=your_razorpay_test_secret_here
    ```

    **Note:** To enable online payments, set the `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your `.env` file. If these are not set, the server will handle payment endpoints gracefully but will return a 503 indicating that the payment gateway is not configured.

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

### Running the Server

-   **Development Mode (with auto-reload):**
    ```bash
    npm run dev
    ```

-   **Production Mode:**
    ```bash
    npm start
    ```

The server will start on `http://localhost:5000` (or your defined PORT).

### API Documentation
Refer to `API_DOCUMENTATION.md` for detailed endpoint descriptions.
