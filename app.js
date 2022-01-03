const path = require('path');

const express = require('express');

const blogRoutes = require('./routes/blog');
const db = require('./data/database');

const app = express();

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)

app.use(blogRoutes);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});

// establishing connection to the database
// it will return a promise, but we can't use await as no async is available
// hence, we use then()
db.connectToDatabse().then(function() {
  // only start the webserver if we have an active database connection
  app.listen(3000);
})

