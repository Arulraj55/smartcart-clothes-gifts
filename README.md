# SmartCart: Clothes & Gifts

A full-stack e-commerce application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring **lightweight Machine Learning** for personalized product recommendations and intelligent search ranking.

## 🧠 Machine Learning Features

### 1. **Product Recommendation System**
- **Content-based filtering** for similar product suggestions
- **Collaborative filtering** based on user behavior patterns
- **Real-time personalization** that adapts to user preferences
- **Cross-selling and upselling** opportunities

### 2. **Personalized Search Ranking**
- **Dynamic search result reordering** based on user preferences
- **Intelligent query suggestions** powered by ML
- **Trending search detection** and promotion
- **Typo tolerance** and fuzzy matching

### 3. **User Behavior Analytics**
- **Real-time behavior tracking** (views, clicks, purchases)
- **Session-based learning** for immediate personalization
- **A/B testing support** for ML model optimization
- **Engagement metrics** and conversion tracking

## 🚀 Key Features

### E-commerce Core
- **Product catalog** with advanced filtering and sorting
- **Shopping cart** with persistent state
- **User authentication** and profile management
- **Order management** and history
- **Wishlist** functionality
- **Product reviews** and ratings
- **Responsive design** for all devices

### ML-Powered Enhancements
- **Smart product recommendations** on homepage and product pages
- **Personalized search results** with ML ranking
- **Intelligent product suggestions** during browsing
- **Trending products** detection and promotion
- **Similar products** recommendations
- **Real-time personalization** based on user behavior

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Redis** for ML model caching
- **Custom ML algorithms** (no external ML services)

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API communication

### Machine Learning
- **Lightweight algorithms** optimized for real-time performance
- **In-memory processing** for fast recommendations
- **Incremental learning** that updates with new user data
- **Content-based and collaborative filtering** techniques

## 📁 Project Structure

```
mern-ecommerce-ml/
├── backend/
│   ├── ml/
│   │   ├── recommendationEngine.js    # Core recommendation algorithms
│   │   └── searchRanking.js          # Search ranking and suggestions
│   ├── models/
│   │   ├── Product.js                # Product data model
│   │   ├── User.js                   # User data model
│   │   ├── Order.js                  # Order data model
│   │   └── UserBehavior.js           # Behavior tracking model
│   ├── routes/
│   │   ├── recommendations.js        # ML recommendation endpoints
│   │   ├── search.js                 # Smart search endpoints
│   │   ├── products.js               # Product CRUD operations
│   │   └── analytics.js              # Behavior tracking endpoints
│   ├── middleware/
│   ├── config/
│   ├── server.js                     # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ML/
│   │   │   │   ├── RecommendationEngine.js  # Recommendation component
│   │   │   │   └── SmartSearch.js           # Smart search component
│   │   │   ├── Products/
│   │   │   ├── Layout/
│   │   │   └── UI/
│   │   ├── contexts/
│   │   │   ├── MLContext.js          # ML state management
│   │   │   ├── AuthContext.js        # Authentication context
│   │   │   └── CartContext.js        # Shopping cart context
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🧠 Machine Learning Implementation

### Recommendation Engine
The recommendation system uses a hybrid approach combining:

1. **Content-Based Filtering**
   - Analyzes product features (category, brand, price, etc.)
   - Creates product vectors for similarity matching
   - Recommends items similar to user's past preferences

2. **Collaborative Filtering**
   - Learns from user behavior patterns
   - Builds user preference profiles
   - Suggests products liked by similar users

3. **Real-Time Learning**
   - Updates recommendations based on immediate user actions
   - Adapts to changing user preferences
   - Provides contextual suggestions

### Search Ranking Algorithm
The search system implements:

1. **Text Relevance Scoring**
   - TF-IDF based relevance calculation
   - Multi-field search (title, description, tags)
   - Fuzzy matching for typo tolerance

2. **Personalization Layer**
   - User preference integration
   - Historical search behavior analysis
   - Category and brand preference weighting

3. **Popularity and Freshness Signals**
   - Product popularity metrics
   - Trending score calculation
   - Recency boost for new products

## 🔧 Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://arulraj:Arul%402006@cluster-smartcart.oilosnj.mongodb.net/
   JWT_SECRET=your-super-secret-jwt-key
   REDIS_URL=redis://localhost:6379
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: https://smartcart-clothes-gifts-frontend.onrender.com
- Backend API: https://smartcart-clothes-gifts-backend.onrender.com

## 📊 ML Features in Action

### 1. Product Recommendations
- **Homepage recommendations**: Personalized product suggestions
- **Product page recommendations**: Similar and complementary items
- **Category-based recommendations**: Products within user's interests
- **Cross-selling recommendations**: Frequently bought together items

### 2. Smart Search
- **Auto-complete suggestions**: ML-powered query completion
- **Personalized results**: Search results ranked by user preferences
- **Trending searches**: Popular search terms promotion
- **Typo correction**: Fuzzy matching for better search experience

### 3. User Behavior Tracking
- **Page views**: Track product view duration and engagement
- **Search behavior**: Monitor search queries and click patterns
- **Purchase patterns**: Learn from transaction history
- **Real-time adaptation**: Immediate personalization updates

## 🎯 ML Performance Optimization

### Lightweight Design
- **In-memory processing**: No external ML service dependencies
- **Incremental updates**: Real-time model updates without full retraining
- **Efficient algorithms**: Optimized for speed and scalability
- **Caching strategies**: Redis-based caching for fast responses

### Scalability Features
- **Batch processing**: Efficient bulk behavior processing
- **Asynchronous operations**: Non-blocking ML computations
- **Memory management**: Optimized data structures for large catalogs
- **Performance monitoring**: Built-in metrics and optimization

## 🔍 API Endpoints

### ML-Powered Endpoints

```bash
# Get personalized recommendations
GET /api/recommendations?type=personalized&limit=10

# Get similar products
GET /api/recommendations?type=similar&productId=123&limit=5

# Smart search with ML ranking
GET /api/search?q=summer+dress&sortBy=ml_rank

# Search suggestions
GET /api/search/suggestions?q=summ

# Track user behavior
POST /api/analytics/behavior
{
  "action": "view",
  "productId": "123",
  "metadata": { "timeSpent": 45 }
}

# Get trending searches
GET /api/search/trending

# Get ML insights
GET /api/analytics/ml-insights
```

## 🧪 Testing ML Features

### Manual Testing
1. **Create user accounts** and browse products
2. **Search for items** and click on results
3. **Add items to cart** and make purchases
4. **Observe personalization** changes over time
5. **Check recommendation quality** improvements

### Automated Testing
```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 📈 ML Metrics and Analytics

### Recommendation Metrics
- **Click-through rate** on recommended products
- **Conversion rate** from recommendations
- **Diversity score** of recommendation sets
- **Coverage** of product catalog in recommendations

### Search Metrics
- **Search success rate** (clicks after search)
- **Query completion rate** (successful searches)
- **Search ranking effectiveness** (position of clicked items)
- **Suggestion acceptance rate** (auto-complete usage)

## 🚀 Deployment

### Production Deployment
1. **Build frontend**
   ```bash
   cd frontend && npm run build
   ```

2. **Configure environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   REDIS_URL=your-production-redis-uri
   ```

3. **Start production server**
   ```bash
   cd backend && npm start
   ```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📚 ML Algorithm Details

### Content-Based Filtering
- **Feature extraction**: Product attributes vectorization
- **Similarity calculation**: Cosine similarity between product vectors
- **User profile building**: Weighted preference aggregation
- **Recommendation scoring**: Multi-factor scoring algorithm

### Collaborative Filtering
- **User-item matrix**: Sparse matrix for user-product interactions
- **Similarity metrics**: User-based and item-based similarities
- **Matrix factorization**: Lightweight factorization for scalability
- **Cold start handling**: Content-based fallback for new users

### Search Ranking
- **TF-IDF scoring**: Term frequency and inverse document frequency
- **User preference integration**: Historical behavior weighting
- **Popularity signals**: Social proof and trending factors
- **Learning to rank**: Pointwise ranking approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Machine Learning algorithms** inspired by modern recommendation systems
- **E-commerce best practices** from leading online retailers
- **Open source libraries** that make this project possible
- **MERN stack community** for excellent documentation and support

---

## 🎉 Key Benefits

### For Users
- **Personalized shopping experience** that learns from their behavior
- **Faster product discovery** through smart recommendations
- **Improved search results** that match their preferences
- **Reduced decision fatigue** with curated suggestions

### For Business
- **Increased conversion rates** through personalized recommendations
- **Higher average order value** via cross-selling and upselling
- **Improved customer engagement** with relevant product suggestions
- **Better inventory turnover** through intelligent product promotion
- **Valuable customer insights** from behavior analytics

### Technical Advantages
- **Lightweight implementation** without external ML dependencies
- **Real-time personalization** for immediate user experience improvements
- **Scalable architecture** that grows with user base
- **Cost-effective solution** with minimal infrastructure requirements

This MERN e-commerce application demonstrates how **lightweight Machine Learning** can significantly enhance user experience and business outcomes without requiring complex ML infrastructure or external services.
