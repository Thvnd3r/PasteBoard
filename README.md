# PasteBoard

A simple, real-time collaborative paste board application running in a Docker container. 

## Features

- Real-time updates using Socket.IO
- Text and URL detection
- File upload support
- Persistent storage with SQLite

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running the Application

1. Build and start the application:
   ```bash
   docker-compose up --build
   ```

2. Access the application at `http://localhost:3000`



## Tech Stack

- **Backend**: Node.js with Express and Socket.IO
- **Frontend**: React with TypeScript
- **Database**: SQLite
- **Containerization**: Docker

## API Endpoints

- `GET /api/content` - Get all content
- `POST /api/content/text` - Add text content
- `POST /api/content/file` - Upload a file 