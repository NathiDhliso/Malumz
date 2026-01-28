# Changelog

## [1.0.0] - 2026-01-28

### 🎉 Initial Clean Release

### ✅ Fixed Issues
- **CRITICAL**: Fixed Gap Test scoring bug - was showing wrong scale (60 vs 600 points)
- **CRITICAL**: Fixed `HandHeart` icon import error (replaced with `Heart`)
- **CRITICAL**: Removed all Emergent references and watermarks
- **Backend**: Fixed FastAPI deprecation warning (replaced `@app.on_event` with lifespan)
- **Backend**: Added proper uvicorn startup configuration
- **Frontend**: Fixed compilation errors and warnings
- **Frontend**: Cleaned up unused imports

### 🧹 Cleanup & Refactoring
- Removed all Emergent branding and scripts from HTML
- Removed Emergent plugins directory and dependencies
- Simplified craco configuration
- Created clean environment files (.env.example)
- Added proper .gitignore file
- Updated project documentation

### 🚀 New Features
- **In-Memory Storage**: Added temporary storage solution for testing without MongoDB
- **Proper Scoring**: Gap Test now correctly displays scores (30/60 format for UI)
- **Clean Architecture**: Separated concerns for future AWS deployment
- **Comprehensive README**: Added installation and deployment instructions

### 🎨 Design Improvements
- Updated HTML meta tags with Malumz branding
- Added proper font loading (Playfair Display, Inter, Merriweather)
- Maintained consistent Malumz color scheme throughout
- Improved responsive design

### 📊 Gap Test Scoring Logic
- **Raw Scores**: 0-10 per question × 10 questions × 6 trainers = 0-600 total
- **Display Scores**: Divided by 10 for UI display (0-60 total, 0-10 per trainer)
- **Score Ranges**:
  - 0-20: Wild Dog - Surviving, not living
  - 21-35: In Transition - Building the foundation  
  - 36-45: Self-Trained - Making real progress
  - 46-60: Malumz - Leading and training others

### 🔧 Technical Stack
- **Frontend**: React 18, Tailwind CSS, React Router, Axios
- **Backend**: FastAPI, Python 3.13, Pydantic, Uvicorn
- **Storage**: In-memory (development), MongoDB ready (production)
- **Build**: CRACO, npm/pip package management

### 🌐 Deployment Ready
- Clean codebase ready for AWS deployment
- Environment configuration for different stages
- Scalable architecture with separate frontend/backend
- CORS properly configured for cross-origin requests

### 📝 Documentation
- Comprehensive README with setup instructions
- API endpoint documentation
- Environment variable examples
- Contributing guidelines