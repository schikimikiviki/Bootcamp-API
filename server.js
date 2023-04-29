const express = require('express');
const dotenv = require('dotenv');

const bootcamps = require('./routes/bootcamps');
const logger = require(`./middleware/logger.js`);
const connectDB = require('./config/db.js');
const colors = require('colors');
const errorHandler = require('./middleware/error');

dotenv.config({ path: './config/config.env' });

//Connect to DB
connectDB();

const app = express();

//body parser

app.use(express.json());

app.use(logger);

app.use('/api/v1/bootcamps', bootcamps);

app.use(errorHandler);

const PORT = process.env.PORT || 5009;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//Handle unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error message ${err}`.red.bold);
  server.close(() => process.exit(1));
});
