# Token-Based Email Verification System

A comprehensive authentication system with JWT tokens and email verification using Node.js, Express, MongoDB, and Nodemailer. **Now includes a complete frontend interface!**

## Features

- **JWT Token Authentication**: Secure token-based authentication
- **Email Verification**: Token-based email verification system
- **Password Reset**: Secure password reset via email
- **Protected Routes**: Role-based access control
- **Secure Password Hashing**: Bcrypt password encryption
- **Email Templates**: Beautiful HTML email templates
- **Frontend Interface**: Complete web interface for all features
- **Validation**: Input validation with express-validator
- **Error Handling**: Comprehensive error handling

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Update the `.env` file with your configurations (Gmail credentials already set)

3. **Start the server:**
   ```bash
   node server.js
   ```

4. **Open your browser:**
   Navigate to `https://smartcart-clothes-gifts-frontend.onrender.com`

## Frontend Interface

The system now includes a complete frontend interface accessible at `https://smartcart-clothes-gifts-frontend.onrender.com`. The interface includes:

### **🎨 Pages Available:**

1. **Login Page** - Sign in to your account
2. **Register Page** - Create a new account
3. **Dashboard** - View profile and account status
4. **Email Verification** - Automatic verification from email links
5. **Forgot Password** - Request password reset
6. **Reset Password** - Set new password from email link

### **✨ Features:**

- **Responsive Design**: Works on desktop and mobile
- **Real-time Validation**: Instant feedback on form inputs
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Clear error messages
- **Auto-redirect**: Seamless navigation between pages
- **Token Management**: Automatic JWT token storage and management
- **Email Integration**: Direct links from emails to frontend

## How to Use

### **1. Registration Flow:**
1. Go to `https://smartcart-clothes-gifts-frontend.onrender.com`
2. Click "Create Account"
3. Fill in your details (Name, Email, Password)
4. Check your email for verification link
5. Click the verification link in your email
6. Return to the site and login

### **2. Login Flow:**
1. Enter your email and password
2. Click "Sign In"
3. You'll be redirected to your dashboard

### **3. Password Reset Flow:**
1. Click "Forgot Password?" on login page
2. Enter your email address
3. Check your email for reset link
4. Click the reset link in your email
5. Enter your new password
6. Return to login page

### **4. Dashboard Features:**
- View profile information
- Check verification status
- Resend verification email (if unverified)
- Logout functionality

## API Endpoints (Still Available)

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| GET | `/api/auth/verify/:token` | Verify email with token |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Reset password with token |
| GET | `/api/auth/profile` | Get current user profile |

## Email Templates

The system sends beautiful HTML emails for:
- **Email Verification**: Welcome email with verification link
- **Password Reset**: Secure reset link with expiration
- **Welcome Email**: Sent after successful verification

## Security Features

- **Password Hashing**: Bcrypt with salt rounds of 12
- **JWT Tokens**: Signed with secure secret key and expiration
- **Email Tokens**: Crypto-generated random tokens, hashed in database
- **Token Expiration**: Verification tokens expire in 24 hours, reset tokens in 10 minutes
- **Input Validation**: Comprehensive validation for all inputs
- **CORS**: Cross-origin resource sharing enabled
- **Protected Routes**: JWT middleware protection

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Nodemailer with Gmail SMTP
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: crypto for token generation

## File Structure

```
token-email-verification/
├── public/
│   └── index.html          # Frontend interface
├── config/
│   └── database.js         # MongoDB connection
├── controllers/
│   └── authController.js   # Authentication logic
├── middleware/
│   ├── auth.js            # JWT middleware
│   └── validation.js      # Input validation
├── models/
│   └── User.js            # User schema
├── routes/
│   └── authRoutes.js      # API routes
├── utils/
│   └── emailService.js    # Email templates
├── .env                   # Environment variables
├── package.json
└── server.js             # Main server file
```

## Environment Configuration

```env
MONGODB_URI=mongodb+srv://arulraj:Arul%402006@cluster-smartcart.oilosnj.mongodb.net/
PORT=3000
JWT_SECRET=your_generated_secret_key
JWT_EXPIRE=7d
JWT_VERIFICATION_EXPIRE=24h
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://smartcart-clothes-gifts-frontend.onrender.com
NODE_ENV=development
```

## User Journey

1. **User Registration** → Email verification sent
2. **Email Verification** → User clicks link, account activated
3. **Login** → JWT token issued, dashboard access
4. **Protected Features** → Full access to authenticated features
5. **Password Reset** → Secure reset via email if needed

## Testing the System

1. **Start the server:** `node server.js`
2. **Open browser:** Go to `https://smartcart-clothes-gifts-frontend.onrender.com`
3. **Test registration:** Create a new account
4. **Check email:** Verify your email address
5. **Test login:** Sign in with verified account
6. **Test features:** Try password reset, resend verification, etc.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a proper MongoDB connection string
3. Configure a real email service
4. Set up SSL/HTTPS
5. Use environment-specific JWT secrets

## Support

The system includes comprehensive error handling and user feedback. All actions provide clear success/error messages to guide users through each process.

**No more Postman needed! Everything is now accessible through the beautiful web interface!** 🎉
