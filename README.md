# Expense Tracker (MERN Stack)

A complete MERN-based Expense Tracker that provides last 30-day expenses, last 60-day income overview, recent transactions, financial statements, and CSV download features.

---

## 🔗 Live Links

### 🌐 Live Demo  
** URL:** https://expense-tracker-h1e1.vercel.app

---

## 📌 Overview

This application helps users track daily income and expenses with detailed analytics:

- Last **30 days expense** overview  
- Last **60 days income** overview  
- Recent transactions  
- Financial statement (total income, total expenses, net balance)  
- CSV download for income sources  
- JWT authentication  
- Fully responsive interface  

---

## ✨ Key Features

### 📊 Financial Analytics
- **Last 30 Days Expenses** (total + category-wise)
- **Last 60 Days Income** (total + source-wise)
- **Financial Statement**:
  - Total Income  
  - Total Expense  
  - Balance  
  - Optional charts

### 🧾 Recent Transactions
- View your latest transactions (income + expense)
- Auto-sorted by date (newest first)
- Quick access on dashboard

### 📥 CSV Download Feature
- Download full income source list as **CSV**
- Includes: date, source, amount, notes

### 🔐 Authentication
- JWT-secured login & signup  
- Protected routes for dashboard and financial pages  

---

## 📡 Important API Endpoints

### Dashboard / Financial Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Final financial statement |
| GET | `/api/dashboard/last-30-days-expense` | Last 30-day expense data |
| GET | `/api/dashboard/last-60-days-income` | Last 60-day income data |
| GET | `/api/dashboard/recent-transactions` | Recent transactions |

### Income Routes
| GET | `/api/incomes/download?format=csv` | Download income CSV |

---

## 📑 Sample Response (Financial Statement)

```json
{
  "totalIncome": 45000,
  "totalExpense": 28000,
  "netBalance": 17000,
  "last30DaysExpense": [...],
  "last60DaysIncome": [...],
  "recentTransactions": [...]
}
