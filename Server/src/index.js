import dotenv from 'dotenv';
import connectDB from '../db/db-connection.js';
import app from './app.js'
dotenv.config({
    path: './.env'
})

import { seedFoodDatabase } from '../utils/seedFoodDatabase.js';

// -------------------------Db Connection----------------------
connectDB()

.then(() => {
    // Seed Food Database from CSV if empty or out of sync
    seedFoodDatabase();

    // Maker Server listen on port 
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log("---------------------------------------------------------------");
        console.log(`⚙️  Server is running at port : ${PORT}`);
        console.log("---------------------------------------------------------------");
    });

    // app.listen(process.env.PORT || 8000, () => {
    //     console.log("---------------------------------------------------------------");
    //     console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    //     console.log("---------------------------------------------------------------");
    // })
})
.catch((err) => {
    // If Server Failed to listen, log the error
    console.log("---------------------------------------------------------------");
    console.log(`❌ Server Connection Failed : ${err}`);
    console.log("---------------------------------------------------------------");
})
