# Flask Backend

A Flask REST API backend that connects to the Next.js frontend.

## Features

- RESTful API endpoints for CRUD operations
- CORS enabled for frontend communication
- JSON responses
- Error handling
- Health check endpoint

## API Endpoints

- `GET /` - API information and available endpoints
- `GET /api/data` - Get all data items
- `GET /api/data/<id>` - Get specific data item by ID
- `POST /api/data` - Create new data item
- `PUT /api/data/<id>` - Update data item by ID
- `DELETE /api/data/<id>` - Delete data item by ID
- `GET /api/health` - Health check endpoint

## Getting Started

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Option A: Use the setup script (recommended)**
   
   **On macOS/Linux:**
   ```bash
   ./activate.sh
   ```
   
   **On Windows:**
   ```cmd
   activate.bat
   ```

3. **Option B: Manual setup**
   
   Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
   
   Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

### Environment Variables

You can set the following environment variables:

- `FLASK_DEBUG` - Set to `True` for debug mode (default: `True`)
- `PORT` - Port number to run the server (default: `5000`)

## API Usage Examples

### Get all data
```bash
curl http://localhost:5000/api/data
```

### Create new data
```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{"title": "New Item", "description": "Item description"}'
```

### Update data
```bash
curl -X PUT http://localhost:5000/api/data/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Item", "description": "Updated description"}'
```

### Delete data
```bash
curl -X DELETE http://localhost:5000/api/data/1
```

## Development

The backend is configured with CORS to allow requests from `http://localhost:3000` (Next.js frontend). Make sure both servers are running for full functionality.

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
└── README.md          # This file
```