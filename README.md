# Malumz Movement

**Rebuilding what apartheid destroyed through the Six Trainers framework**

From 21/60 to 37/60 in 18 months. The Six Trainers Framework that rebuilt one man—and can rebuild 100,000 more.

## Overview

The Malumz Movement is a comprehensive platform designed to help men rebuild their lives through the Six Trainers framework:

1. **Family Trainer** - Love. Protection. Provision. Not money—stability.
2. **Community Trainer** - Find your pack. Build accountability. Stop bleeding alone.
3. **Academic Trainer** - You're not stupid. You were just never trained right.
4. **Economic Trainer** - From survival mode to legacy mode.
5. **Identity Trainer** - Strength = Service, not Dominance. Provide. Protect. Love.
6. **Spiritual Trainer** - Your moral anchor when everything else collapses.

## Features

- **Gap Test**: Interactive assessment across all six trainers (60-point scale)
- **Book Purchase**: Digital copy of "The Dog Trainer" 
- **Contact System**: Direct communication with the movement
- **Responsive Design**: Mobile-first approach with Malumz branding
- **Clean Architecture**: Separate frontend and backend for scalability

## Tech Stack

### Frontend
- React 18 with React Router
- Tailwind CSS with custom Malumz color scheme
- Lucide React icons
- Axios for API calls
- CRACO for build configuration

### Backend
- FastAPI with Python 3.13
- MongoDB with Motor (async driver)
- Pydantic for data validation
- CORS enabled for frontend integration
- Uvicorn ASGI server

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.13+
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd malumz-movement
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Configure environment
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   
   # Start the server
   python server.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## API Endpoints

- `GET /api/` - Health check
- `POST /api/gap-test` - Submit Gap Test assessment
- `GET /api/gap-test/{test_id}` - Retrieve Gap Test results
- `POST /api/contact` - Submit contact form
- `POST /api/mock-purchase` - Mock book purchase
- `POST /api/status` - Status check endpoint

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=malumz_movement
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Deployment

### AWS Infrastructure (Terraform)
Complete infrastructure as code for AWS deployment:

```bash
cd terraform
./scripts/setup.sh          # Initial setup
./scripts/deploy.sh dev plan # Plan deployment
./scripts/deploy.sh dev apply # Deploy infrastructure
```

**What gets deployed:**
- AWS Amplify (frontend hosting with CI/CD)
- AWS Lambda + API Gateway (serverless backend)
- Amazon DocumentDB (MongoDB-compatible database)
- CloudWatch (logging and monitoring)
- S3 (asset storage and backups)
- VPC (secure networking)

**Estimated costs:**
- Development: ~$55-120/month
- Production: ~$125-405/month

See `terraform/README.md` and `DEPLOYMENT.md` for detailed instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to the Malumz Movement.

## Contact

- **Email**: nkosinathi.dhliso@gmail.com
- **Location**: Johannesburg, South Africa
- **Website**: malumz.co.za

---

*"You're not broken. You were never trained."*