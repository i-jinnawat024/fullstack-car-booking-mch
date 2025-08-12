const express = require('express');
const {readdirSync} = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const port = process.env.PORT;
const moment = require('moment-timezone');
const loadManuals = require('./middleware/loadManuals'); // Adjust the path to your middleware

const connectDB = require('./Config/db');

global.error = null;
app.use(loadManuals);
app.use(flash());
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '10mb'}));

// Session setup
app.use(session({secret: 'secret', resave: true, saveUninitialized: true}));

// Static files
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/uploads', express.static('uploads'));
// Set the timezone to Asia/Bangkok
moment.tz.setDefault('Asia/Bangkok');

// Engine setup
app.set('views', path.join(__dirname, 'Views')); // Use lowercase "views"
app.set('view engine', 'ejs');

//routes
readdirSync('./Routes').map(r => app.use('/', require('./Routes/' + r)));

connectDB()
  .then(
    app.listen(port, () =>
      console.log(`Server is running on http://localhost:${port} Try to use`)
    )
  )
  .catch(err => console.log(err));

module.exports = app;
