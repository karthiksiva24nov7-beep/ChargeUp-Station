# ChargeUp Station – EV Charger Rental Management API

## Project Overview

ChargeUp Station is a RESTful API developed using Node.js, Express.js, and SQLite. It manages commuters, electric vehicle charging stations, and charger rental records.

The application provides CRUD operations, charger searching, rental management, data validation, and a restriction that allows each commuter to have a maximum of three active rentals.

## Technologies Used

- Node.js
- Express.js
- SQLite
- Better-SQLite3
- JavaScript
- Postman
- Nodemon

## Project Structure

```text
ChargeUp-Station/
│
├── config/
│   └── database.js
│
├── routes/
│   ├── commuterRoutes.js
│   ├── chargerRoutes.js
│   └── rentalRoutes.js
│
├── app.js
├── package.json
├── package-lock.json
├── .gitignore
├── README.md
└── ChargeUp-Station-Postman-Collection.json
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/karthiksiva24nov7-beep/ChargeUp-Station.git
```

### 2. Navigate to the Project Folder

```bash
cd ChargeUp-Station
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The server runs at:

```text
http://localhost:3000
```

The SQLite database and required tables are initialized automatically when the application starts.

## API Endpoints

### 1. Commuter Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/commuters` | Get all commuters |
| GET | `/commuters/:id` | Get commuter by ID |
| POST | `/commuters` | Add a commuter |
| PUT | `/commuters/:id` | Update commuter |
| DELETE | `/commuters/:id` | Delete commuter |

### 2. Charger Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/chargers` | Get all chargers |
| GET | `/chargers/:id` | Get charger by ID |
| POST | `/chargers` | Add a charger |
| PUT | `/chargers/:id` | Update charger |
| DELETE | `/chargers/:id` | Delete charger |
| GET | `/chargers?type=fast` | Search chargers by type |

### 3. Rental Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rentals` | Get all rentals with commuter and charger names |
| GET | `/rentals/:id` | Get rental by ID |
| POST | `/rentals` | Create a rental |
| PUT | `/rentals/:id/return` | Return a rental |

## Database Structure

The application uses three SQLite tables:

**1. Commuters**
- id
- name
- email

**2. Chargers**
- id
- name
- type

**3. Rentals**
- id
- commuter_id
- charger_id
- rental_date
- return_date
- status

Foreign keys maintain relationships between commuters, chargers, and rentals.

## Special Business Rule

A commuter can have a maximum of three active rentals at a time.

- The first three active rentals are allowed.
- A fourth active rental attempt returns HTTP status `409 Conflict`.
- The error message is:

```json
{
  "error": "Limit of 3 reached"
}
```

- Returning an active rental frees a slot for another rental.

## Validation and Error Handling

The API handles:

- Missing or invalid input.
- Invalid IDs.
- Duplicate commuter email addresses.
- Nonexistent commuters and chargers.
- Attempts to exceed the rental limit.
- Attempts to delete records referenced by existing rentals.

Appropriate HTTP status codes are returned, including `200`, `201`, `400`, `404`, `409`, and `500`.

## Testing

The API endpoints were tested using Postman.

The Postman collection is included in:

`ChargeUp-Station-Postman-Collection.json`

Import this file into Postman to access the API requests.

## Expected Server Output

```text
Database connected successfully!
Three tables created successfully!
Server running at http://localhost:3000
```

## Conclusion

ChargeUp Station demonstrates RESTful API development, SQLite database integration, CRUD operations, relational data handling, input validation, and business rule implementation using Node.js and Express.js.
