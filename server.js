import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from './routes/propertyRoutes.js';
import { connectDB } from "./config/db.js";

// 
connectDB();


const app = express();


// app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:2230/', // Your dev frontend
    'https://niarobi.netlify.app/', // Your production frontend
  ],
  credentials: true
}));
app.use(express.json());


app.get("/", (req, res) => {
  res.json("Niarobi Apartments Api");
});


app.use('/api/user', authRoutes);
app.use('/api/properties', propertyRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;