import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true, //Uses MongoDB’s new connection string parser. Avoids warnings related to deprecated URL formats.
            // useUnifiedTopology: true, //Uses MongoDB’s new Server Discover and Monitoring engine. Improves performance & stability.
        });
        console.log("------------------------------------------------------------------------------------");
        console.log(`✅ MongoDB succsessfully Connected: ${conn.connection.host}`);
        console.log("------------------------------------------------------------------------------------");

    } catch (error) {
        console.log("---------------------------------------------------------------");
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log("---------------------------------------------------------------");
        process.exit(1);
    }
}

export default connectDB;
// export deafult vs export 
// export default is used to export a single class, function or primitive, which can be imported using any name.
// export is used to export multiple classes, functions or primitives, which can be imported using the destructuring syntax.
