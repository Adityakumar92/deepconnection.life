const mongoose =require('mongoose');

const mongoDBURL = process.env.MONGODB_URL;

if(!mongoDBURL){
    console.log('MONGODB_URL is not defined in the environment variables');
    throw new Error('MONGODB_URL is not defined in the environment variables');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(mongoDBURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
}

connectDB();