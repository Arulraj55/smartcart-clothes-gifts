# MERN E-commerce ML - Quick Start Guide

Welcome to the MERN E-commerce application with Machine Learning capabilities! This guide will help you get started quickly.

## 🚀 Quick Setup (5 minutes)

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or higher)
- [Git](https://git-scm.com/)

### 1. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd mern-ecommerce-ml

# Install all dependencies
npm run install-all
```

### 2. Database Setup
```bash
# Start MongoDB (if not running as service)
mongod

# The application will create the database automatically
```

### 3. Environment Configuration
```bash
# Backend environment
cd backend
cp .env.example .env

# Edit .env with your settings (MongoDB URI, JWT secret, etc.)
```

### 4. Start the Application
```bash
# From the root directory, start both frontend and backend
npm run dev
```

**That's it!** 🎉

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🧠 Experience the ML Features

### 1. Create User Accounts
```bash
# Visit http://localhost:3000/register
# Create 2-3 different user accounts for testing
```

### 2. Browse and Interact
- **View products** - ML tracks your interests
- **Search for items** - Smart suggestions appear
- **Add to cart** - Behavior influences recommendations
- **Complete purchases** - Strengthens preference learning

### 3. Watch ML in Action
After 5-10 product interactions, you'll see:
- **Personalized recommendations** on the homepage
- **Smart search suggestions** with auto-complete
- **Similar products** on product detail pages
- **Trending items** based on global behavior

## 📊 ML Features Demo Data

### Sample Products Categories
- Men's Clothing (Shirts, Pants, Jackets)
- Women's Clothing (Dresses, Tops, Accessories)
- Kids' Clothing (All categories)
- Shoes (Sneakers, Boots, Sandals)
- Accessories (Bags, Jewelry, Watches)
- Gift Items (Electronics, Books, Home Decor)

### Test Scenarios
1. **Content-Based Recommendations**
   - View several products in "Men's Shirts"
   - Check recommendations - should show similar shirts

2. **Collaborative Filtering**
   - Have multiple users view and buy similar items
   - Recommendations should include items liked by similar users

3. **Search Intelligence**
   - Search for "summer dress"
   - Notice personalized ranking based on your preferences
   - Try typos like "sumr dres" - fuzzy matching works

4. **Real-Time Learning**
   - Add items to wishlist
   - Immediately see recommendations change

## 🛠 Development Mode

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start   # Starts with hot reload
```

### Database Management
```bash
# Seed sample data
cd backend
npm run seed

# View data in MongoDB Compass
# Connection: mongodb://localhost:27017/mern-ecommerce-ml
```

## 🔧 Configuration Options

### ML Settings (backend/.env)
```env
# Recommendation engine settings
ML_RECOMMENDATION_THRESHOLD=0.6      # Minimum similarity score
ML_CACHE_DURATION=3600              # Cache duration in seconds
ML_BATCH_SIZE=100                   # Batch processing size

# Search ranking weights
ML_SEARCH_RANKING_WEIGHTS={"relevance": 0.4, "popularity": 0.3, "user_preference": 0.3}
```

### Frontend Settings
```env
# Environment variables (frontend/.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ML_ENABLED=true
REACT_APP_ANALYTICS_ENABLED=true
```

## 📱 Testing on Mobile

### Local Network Testing
```bash
# Find your local IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Update frontend .env
REACT_APP_API_URL=http://YOUR_LOCAL_IP:5000/api

# Access from mobile: http://YOUR_LOCAL_IP:3000
```

## 🐳 Docker Setup (Alternative)

### Using Docker Compose
```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing ML Features

### Manual Testing Checklist
- [ ] User registration and login works
- [ ] Product browsing tracks views
- [ ] Search provides suggestions
- [ ] Recommendations appear after browsing
- [ ] Similar products show on detail pages
- [ ] Cart and checkout process works
- [ ] User behavior affects future recommendations

### API Testing
```bash
# Test recommendation endpoint
curl "http://localhost:5000/api/recommendations?type=trending&limit=5"

# Test search with ML ranking
curl "http://localhost:5000/api/search?q=shirt&sortBy=ml_rank"

# Test search suggestions
curl "http://localhost:5000/api/search/suggestions?q=summ"
```

## 🚨 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Windows: net start MongoDB
# Mac: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongod
```

**Port Already in Use**
```bash
# Kill process on port 3000/5000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

**ML Recommendations Not Showing**
- Create user account and log in
- Browse/search for 5+ products
- Wait 30 seconds for ML processing
- Refresh the page

**Search Suggestions Not Working**
- Type at least 2 characters
- Ensure backend is running
- Check browser console for errors

### Reset Everything
```bash
# Clear all data and restart
docker-compose down -v  # If using Docker
mongod --dbpath /data/db --repair  # Repair MongoDB
npm run install-all     # Reinstall dependencies
npm run dev            # Restart application
```

## 📚 Learning Resources

### Understanding the ML Components
1. **Recommendation Engine** (`backend/ml/recommendationEngine.js`)
   - Content-based filtering implementation
   - User preference profiling
   - Real-time recommendation scoring

2. **Search Ranking** (`backend/ml/searchRanking.js`)
   - Text relevance calculation
   - User behavior integration
   - Personalized result ranking

3. **Behavior Tracking** (`backend/models/UserBehavior.js`)
   - User interaction logging
   - ML-ready data structure
   - Analytics and insights

### Next Steps
- Explore the codebase
- Modify ML algorithms
- Add new recommendation types
- Implement A/B testing
- Scale with real data

## 🎯 Production Deployment

### Quick Production Setup
```bash
# Build for production
npm run build

# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=your-production-mongo-uri

# Start production server
cd backend && npm start
```

### Performance Optimization
- Enable MongoDB indexing
- Configure Redis caching
- Implement CDN for images
- Set up load balancing
- Monitor ML performance metrics

---

**Need Help?** Check the main README.md or create an issue in the repository.

**Happy Coding!** 🚀✨
