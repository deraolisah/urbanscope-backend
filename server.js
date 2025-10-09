import express from 'express';
// import mongoose from 'mongoose';
import cors from 'cors';
import propertyRoutes from './routes/propertyRoutes.js';
import { connectDB } from "./config/db.js";


connectDB();


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/properties', propertyRoutes);


app.listen(5000, () => console.log('Server running on port 5000'));

export default app;