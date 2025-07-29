# Gemini Backend Clone - Kuvaka Tech Assignment

This repository contains the backend implementation for a Gemini-style chat application, built as a technical assignment for Kuvaka Tech.

**Deployment URL:** `[Your Deployed App URL will go here]`

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Setup and Installation](#setup-and-installation)
- [How to Test with Postman](#how-to-test-with-postman)
- [Design Decisions](#design-decisions)

---

## Features

- **User Authentication:** Secure OTP-based login (mobile only) using JWT for session management.
- **Chatroom Management:** Users can create and manage multiple chatrooms.
- **Real-time AI Conversations:** Asynchronous message processing with Google Gemini API via a message queue.
- **Caching:** Implemented Redis/Node-cache for the `GET /chatroom` endpoint to improve performance and reduce database load.
- **Scalable Backend:** Separate API server and background worker for handling long-running tasks efficiently.

*(Add any other features you've completed, like the Stripe integration if you've done it)*

---

## Architecture Overview

The system is designed with a separation of concerns:

1.  **API Server (Node.js/Express):** Handles all incoming HTTP requests, validates user input, and manages authentication. It is responsible for the immediate response to the client.
2.  **PostgreSQL Database:** The primary data store for users, chatrooms, and messages.
3.  **Redis:** Serves two purposes:
    * **Message Broker for BullMQ:** Manages the queue of jobs to be processed by the worker.
    * **Cache:** Stores frequently accessed data, like a user's list of chatrooms, to reduce database queries.
4.  **Worker Process:** A separate Node.js process that listens for jobs on the BullMQ queue. It is solely responsible for communicating with the external Google Gemini API. This asynchronous design ensures the API server remains fast and responsive, even if the Gemini API is slow.

![Architecture Diagram](https://i.imgur.com/8aGZ5eB.png)

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Queue:** BullMQ
- **Cache:** Redis (via ioredis) / node-cache
- **Authentication:** JSON Web Tokens (JWT)
- **External APIs:** Google Gemini API

---

## API Endpoints

A Postman collection is included in this submission.

| Method | Endpoint                  | Auth Required | Description                                     |
| :----- | :------------------------ | :------------ | :---------------------------------------------- |
| `POST` | `/api/auth/send-otp`      | No            | Sends a mock OTP to the user's mobile number.   |
| `POST` | `/api/auth/verify-otp`    | No            | Verifies OTP and returns a JWT.                 |
| `POST` | `/api/chatroom`           | Yes           | Creates a new chatroom for the user.            |
| `GET`  | `/api/chatroom`           | Yes           | Lists all chatrooms for the user (cached).      |
| `GET`  | `/api/chatroom/:id`       | Yes           | Retrieves a specific chatroom with messages.    |
| `POST` | `/api/chatroom/:id/message` | Yes           | Sends a message (processed asynchronously). |
| ...    | *(Add other endpoints you built)* | ...           | ...                                             |

---

## Setup and Installation

1.  **Prerequisites:**
    * Node.js (v18+)
    * PostgreSQL
    * Docker (for Redis) or a running Redis instance

2.  **Clone the repository:**
    ```bash
    git clone [Your GitHub Repo URL]
    cd gemini-backend-clone
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    JWT_SECRET="your_jwt_secret"
    REDIS_URL="redis://localhost:6379"
    GEMINI_API_KEY="your_gemini_api_key"
    ```

5.  **Run the database migrations/setup:**
    *(If you have SQL files, explain how to run them here)*

6.  **Start the application (requires two terminals):**
    * **Terminal 1 (API Server):**
        ```bash
        npm run dev
        ```
    * **Terminal 2 (Worker):**
        ```bash
        npm run worker
        ```

---

## How to Test with Postman

1.  Import the provided Postman collection file (`Gemini_Clone.postman_collection.json`).
2.  Follow the requests in the "Authentication" folder first to get a JWT token.
3.  The token will be automatically saved as a collection variable and used in all protected requests.
4.  Run the requests in the "Chatrooms" folder to test the core functionality.

---

## Design Decisions

-   **Asynchronous Processing:** I chose BullMQ for the message queue because it is modern, robust, and well-suited for Node.js. This was a critical decision to ensure the user experience is not degraded by the latency of the external Gemini API.
-   **Caching Strategy:** Caching the `GET /chatroom` endpoint was a specific requirement. I used a simple time-based TTL cache because the list of chatrooms does not change frequently, making it a perfect candidate for caching to improve performance.
-   **Separate Worker:** Running the AI processing in a separate worker process makes the system more scalable. In a production environment, we could run multiple worker instances to handle a high volume of messages without affecting the main API's performance.
