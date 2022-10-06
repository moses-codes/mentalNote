const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')

//Load config sd
dotenv.config({ path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

//Logging
if(process.env.NODE_ENV === 'dev'){
    app.use(morgan('dev'))
    //makes sure that morgan runs in DEV mode only
}

//Handlebars
app.engine('.hbs', exphbs.engine(
    {   
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

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))


const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} on port ${PORT}`))