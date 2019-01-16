const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// Load Model
require('./models/User');
require('./models/Story');

// Passport config
require('./config/passport')(passport);

// Load Routes
const auth = require('./routes/auth');
const stories = require('./routes/stories');
const index = require('./routes/index');

// Load Keys
const keys = require('./config/keys');

// Handlebars helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require('./helpers/hbs');

mongoose.promise = global.Promise;
// Mongoose Connect
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch( err => console.log(err));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));

app.engine('handlebars', exphbs({
  helpers: {
    formatDate: formatDate,
    truncate: truncate,
    stripTags: stripTags,
    select: select,
    editIcon: editIcon
  },
  defaultLayout:'main'
}));
app.set('view engine', 'handlebars');

app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/auth', auth);
app.use('/stories', stories);
app.use('/', index);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});