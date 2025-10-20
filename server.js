import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from './routes/propertyRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import favoriteRoutes from './routes/favoriteRoutes.js';
import cookieParser from 'cookie-parser';
import { connectDB } from "./config/db.js";

// CONNECT DATABASE
connectDB();


const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:2330', // ✅ exact dev origin
    'https://urbanscope.netlify.app' // ✅ exact production origin
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());


// Routes 
app.get("/", (req, res) => {
  res.json("Urban Scope Api");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});


// Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Export for vercel
export default app;