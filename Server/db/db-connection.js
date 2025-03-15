import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true, //Uses MongoDB’s new connection string parser. Avoids warnings related to deprecated URL formats.
            // useUnifiedTopology: true, //Uses MongoDB’s new Server Discover and Monitoring engine. Improves performance & stability.
        });
        console.log("---------------------------------------------------------------");
        console.log(`✅ MongoDB succsessfully Connected: ${conn.connection.host}`);
        console.log("---------------------------------------------------------------");

        const UserDB = mongoose.connection.useDb(process.env.USER_DB);
        console.log(`✅ ${UserDB.name} Connected`);
        const HabitDB = mongoose.connection.useDb(process.env.HABIT_DB);
        console.log(`✅ ${HabitDB.name} Connected`);
        const ExpenseDB = mongoose.connection.useDb(process.env.EXPENSE_DB);
        console.log(`✅ ${ExpenseDB.name} Connected`);

        global.databases = { UserDB, HabitDB, ExpenseDB };

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
