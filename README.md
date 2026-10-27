
# Mini Banking Transaction App

A simple full-stack banking application built to demonstrate
React frontend development, REST APIs, and database operations.

## Technologies Used

- Frontend: React and TypeScript
- Backend: Node.js and Express.js
- Database: SQLite
- API Testing: Postman

## Features

- View account balance
- Deposit money
- Withdraw money
- View transaction history
- View transaction summary
- Validate transaction amounts
- Prevent withdrawals when the balance is insufficient

## Project Structure

- client/ - React frontend
- server/ - Express backend and SQLite database

## How to Run

### 1. Start the backend

Open a terminal and run:

    cd server
    npm install
    npm run dev

The backend runs at http://localhost:5000.

### 2. Start the frontend

Open a second terminal and run:

    cd client
    npm install
    npm run dev

Open the local URL shown in the terminal, usually
http://localhost:5173.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/account | View account balance |
| GET | /api/transactions | View transaction history |
| POST | /api/transactions/deposit | Deposit money |
| POST | /api/transactions/withdraw | Withdraw money |
| GET | /api/transactions/summary | View transaction summary |

## Notes

This is an educational demo application. It does not process
real payments and is not intended for production banking.
