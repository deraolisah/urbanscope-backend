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



app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:2330', // ✅ exact dev origin
    'https://niarobi.netlify.app' // ✅ exact production origin
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());


app.get("/", (req, res) => {
  res.json("Niarobi Apartments Api");
});


app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


export default app;