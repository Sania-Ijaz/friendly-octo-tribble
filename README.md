# LifeWork Manager

A comprehensive personal Life, Work, and Finance Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **Activities** – Create and manage activities with custom types and tags
- **Tasks** – Track quantitative progress linked to activities
- **Inputs** – Log time, money, effort, and other inputs per event
- **Outcomes** – Record daily and long-term outcomes
- **Resources** – Manage reusable resources with usage metrics
- **People** – Track people (clients, trainers, partners, etc.) and their interactions
- **Events** – Central logging hub: every event automatically updates linked entities
- **Financial Accounts** – Track balances that update automatically via events
- **Analytics** – Raw metrics, trends, and resource/people utilization

## Project Structure

```
/
├── server/          # Node.js + Express backend
│   ├── models/      # Mongoose schemas
│   ├── routes/      # Express route definitions
│   ├── controllers/ # Route handler logic
│   └── middleware/  # Event auto-update middleware
├── client/          # React.js frontend
│   └── src/
│       ├── api/     # Axios API client
│       ├── context/ # Global state management (Context API)
│       ├── components/ # Reusable UI components
│       └── pages/   # Page-level components
└── package.json     # Root scripts
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies
npm run install-all

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI
```

### Running

```bash
# Start both server and client (development)
npm run dev

# Start server only
npm run server

# Start client only
npm run client
```

The backend API runs on `http://localhost:5000/api`  
The frontend runs on `http://localhost:3000`

## API Endpoints

| Entity | Base URL |
|--------|----------|
| Activities | `/api/activities` |
| Tasks | `/api/tasks` |
| Inputs | `/api/inputs` |
| Outcomes | `/api/outcomes` |
| Resources | `/api/resources` |
| People | `/api/people` |
| Events | `/api/events` |
| Accounts | `/api/accounts` |

All entities support full CRUD: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`

### Special Endpoints
- `GET /api/activities/filter?type=&tag=&name=` – Filter activities
- `GET /api/activities/:id/details` – Activity with all linked entities populated
- `PUT /api/tasks/:id/progress` – Update task progress
- `GET /api/events/filter?activityId=&startDate=&endDate=&resourceId=&personId=&accountId=` – Filter events
- `GET /api/accounts/filter?type=&minBalance=&maxBalance=` – Filter accounts

## Event Auto-Update Logic

When an event is created, the system automatically:
1. Adds the event ID to each linked activity's events array
2. Updates task progress (increments `quantitativeProgress`)
3. Updates resource usage metrics (`timesUsed`)
4. Adds the event to each linked person's `linkedEvents`
5. Adjusts financial account balance (earned = +amount, spent = −amount)
