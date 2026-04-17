# Finance Tracker

This is a full-stack finance tracking application built with React (frontend) and Node/Express (backend) using PostgreSQL for data storage.

## Setup

### Backend

see `backend/README.md` for detailed instructions including database setup.

### Frontend

From project root:
```bash
cd frontend
npm install
npm run dev
```

The React app will run on Vite default port (typically 5173).

## Features

- User authentication with JWT (register/login, protected routes)
- Stores token in `localStorage` and includes it on API requests
- Add, edit, delete transactions
- Filter by income/expense
- Transaction detail modal with edit/delete
- Analytics dashboard with totals and trends
- Floating action button to add a transaction

## Database

PostgreSQL

## Future Enhancements

- Recurring transactions
- Export reports (CSV/PDF)
- Mobile-friendly responsive tweaks and PWA support
- Integration with third-party financial APIs
- Role-based access control, multi-user support

Enjoy building your finance tracker!
