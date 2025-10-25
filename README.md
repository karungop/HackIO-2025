# HackIO-2025 Full Stack Application

A full-stack web application with Next.js frontend and Flask backend.

## Project Structure

```
HackIO-2025/
├── frontend/           # Next.js React frontend
│   ├── app/           # App Router pages and components
│   ├── package.json   # Frontend dependencies
│   └── README.md      # Frontend setup instructions
├── backend/           # Flask Python backend
│   ├── app.py         # Main Flask application
│   ├── requirements.txt # Backend dependencies
│   └── README.md      # Backend setup instructions
└── README.md         # This file
```

## Quick Start

### 1. Start the Backend (Flask)

**Option A: Use the setup script (recommended)**
```bash
cd backend
./activate.sh  # On macOS/Linux
# or
activate.bat  # On Windows
python app.py
```

**Option B: Manual setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The backend will run on `http://localhost:5000`

### 2. Start the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Open the Application

Visit `http://localhost:3000` in your browser to see the full-stack application in action.

## Features

- **Frontend**: Modern React with Next.js 14 and App Router
- **Backend**: Flask REST API with CORS enabled
- **Full CRUD**: Create, Read, Update, Delete operations
- **Real-time**: Frontend automatically updates when data changes
- **Responsive**: Mobile-friendly design

## API Endpoints

The Flask backend provides the following REST API endpoints:

- `GET /api/data` - Get all data items
- `POST /api/data` - Create new data item
- `PUT /api/data/<id>` - Update data item
- `DELETE /api/data/<id>` - Delete data item
- `GET /api/health` - Health check

## Development

Both frontend and backend support hot reloading during development. Make sure both servers are running for full functionality.

## Technologies Used

- **Frontend**: Next.js 14, React 18, CSS3
- **Backend**: Flask, Flask-CORS, python-dotenv
- **Communication**: REST API with JSON