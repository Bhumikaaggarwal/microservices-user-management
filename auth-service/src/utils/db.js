const mongoose = require('mongoose');

// This function connects to MongoDB Atlas using the MONGO_URI from your .env file
// We export it as a function so each service calls it when it starts up

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise, so we await it
    // process.env.MONGO_URI reads the value from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure a stable, modern connection:

      // useNewUrlParser: use the new MongoDB connection string parser
      // (the old parser is deprecated)
      useNewUrlParser: true,

      // useUnifiedTopology: use the new server discovery and monitoring engine
      // This makes reconnection after network issues more reliable
      useUnifiedTopology: true,
    });

    // conn.connection.host tells us which Atlas cluster we connected to
    // Example: microservices-cluster.xxxxx.mongodb.net
    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);

  } catch (error) {
    // If connection fails (wrong URI, bad password, IP not whitelisted),
    // log the error and exit the process — the service cannot run without a DB
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // exit code 1 means "crashed with an error"
  }
};

// Listen for disconnection events after initial connection
// This handles cases like Atlas going down or network interruptions
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

// Graceful shutdown — when the Node process is killed (Ctrl+C or server restart),
// close the MongoDB connection cleanly before exiting
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;