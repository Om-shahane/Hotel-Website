# Super Galaxy Hotel — Hotel Website

A hotel website with a plain HTML/CSS/JS frontend and a Node.js + Express + MySQL backend.

## Structure

```
hotel-website/
├── backend/
│   ├── config/
│   │   ├── db.js          # MySQL connection pool
│   │   └── schema.sql     # Database schema + sample room data
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── rooms.js       # GET /api/rooms, /api/rooms/:id, /api/rooms/:id/availability
│   │   ├── bookings.js    # POST/GET /api/bookings
│   │   ├── contact.js     # POST /api/contact
│   │   └── auth.js        # POST /api/auth/login, /api/auth/register
│   ├── server.js          # Express app entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html          # Homepage
    ├── rooms.html          # Room listing + filters
    ├── booking.html        # Booking form with live price summary
    ├── contact.html        # Contact form
    ├── css/style.css
    └── js/
        ├── main.js         # Shared fetch helper, nav toggle
        ├── rooms.js        # Renders room cards from the API
        ├── booking.js      # Booking form logic
        └── contact.js      # Contact form logic
```

## Setup

### 1. Database

Make sure MySQL is running locally, then create the database and tables:

```bash
mysql -u root -p < backend/config/schema.sql
```

This creates a `hotel_db` database, the `rooms`, `bookings`, `contacts`, and `admins`
tables, and inserts 5 sample rooms so the site has content immediately.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL password and a random JWT_SECRET
npm run dev     # nodemon, auto-restarts on changes
# or: npm start
```

The server runs on `http://localhost:5000` by default and **also serves the frontend**
(the `frontend/` folder is served as static files), so you don't need a separate
frontend server — just open `http://localhost:5000` in your browser.

### 3. Create an admin user (optional, for managing bookings)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"choose-a-strong-password"}'
```

Then log in via `POST /api/auth/login` to get a JWT you can use to call
protected admin endpoints (wrap any route with the `requireAuth` middleware
in `backend/middleware/authMiddleware.js` to protect it — none are protected
by default so you can wire up an admin dashboard however you like).

## API summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms` | List all rooms (optional `?type=Deluxe`) |
| GET | `/api/rooms/:id` | Single room details |
| GET | `/api/rooms/:id/availability?checkIn=&checkOut=` | Rooms left for date range |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | List all bookings (admin) |
| PATCH | `/api/bookings/:id/status` | Update booking status (admin) |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/auth/register` | Create an admin account |
| POST | `/api/auth/login` | Admin login, returns JWT |

## Notes

- Booking prevents double-booking by counting overlapping, non-cancelled
  bookings against each room type's `total_rooms`.
- Swap the Unsplash placeholder images in `schema.sql` and the HTML files
  for your own hotel photos before going live.
- For production, put the site behind HTTPS, set a strong `JWT_SECRET`,
  and consider adding rate limiting to the contact/booking endpoints.
