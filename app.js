const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const methodOverride = require('method-override')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')

//Load config sd
dotenv.config({ path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

//BODY PARSER
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

// Method override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

//Logging
if(process.env.NODE_ENV === 'dev'){
    app.use(morgan('dev'))
    //makes sure that morgan runs in DEV mode only
}

//Hamburger Helpers
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')

//Handlebars
app.engine('.hbs', exphbs.engine(
    {   
        helpers: {
            formatDate,
            stripTags,
            truncate,
            editIcon,
            select,
        },
        defaultLayout: 'main',
        extname: '.hbs'
    }
))
app.set('view engine', '.hbs')

//Sessions
app.use(session({
        secret:'kijiji kat',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ 
            mongoUrl: process.env.DB_STRING
        })
    })
)

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} on port ${PORT}`))