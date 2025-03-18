import mongoose from 'mongoose';

const connectToDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return;
    }

    const mongodbUri = process.env.MONGODB_URI;

    if (!mongodbUri) {
      throw new Error(
        'MONGODB_URI environment variable is missing or empty; please check your .env.local file.'
      );
    }

    await mongoose.connect(mongodbUri);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Re-throw the error for the API route to handle
  }
};

export default connectToDatabase;