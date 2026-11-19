# API Documentation

This document lists the available API endpoints in the Salon E-Commerce backend.

## Base URL
`http://localhost:5005/api/v1`

## **Public Endpoints**

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | List all products with filtering options |
| `GET` | `/products/:slug` | Get product details by slug |
| `GET` | `/categories` | List all product categories |

## **Authentication**

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user (Customer/Salon Owner) |
| `POST` | `/auth/login` | Login user |
| `POST` | `/auth/refresh-token` | Refresh access token |
| `POST` | `/auth/logout` | Logout user |

## **User Management** (Protected)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/users/profile` | Get current user profile |
| `PUT` | `/users/profile` | Update user profile |
| `GET` | `/users/agents` | List all agents (Admin only) |

## **Orders** (Protected)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/orders` | Create a new order |
| `GET` | `/orders/my-orders` | Get current user's order history |
| `GET` | `/orders/:id` | Get order details |
| `PUT` | `/orders/:id/status` | Update order status (Admin only) |
| `POST` | `/orders/assign` | Assign agent to order (Admin only) |

## **Payments** (Protected)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/payments/create-order` | Create Razorpay order |
| `POST` | `/payments/verify` | Verify payment signature |

## **Agent Features** (Agent Role)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/agent/dashboard` | Get agent dashboard stats |
| `GET` | `/agent/assigned-orders` | List orders assigned to agent |
| `POST` | `/agent/payout/request` | Request commission payout |

## **Admin Features** (Admin Role)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/dashboard` | Get admin dashboard stats |
| `POST` | `/products` | Create new product |
| `PUT` | `/products/:id` | Update product |
| `DELETE` | `/products/:id` | Delete product |
| `POST` | `/categories` | Create new category |
| `PUT` | `/categories/:id` | Update category |
