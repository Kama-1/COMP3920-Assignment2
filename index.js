require('dotenv').config();
//Define the include function for absolute file name
global.base_dir = __dirname;
global.abs_path = function(path) {
    return base_dir + path;
}
global.include = function(file) {
    return require(abs_path('/' + file));
}

const express = require('express');
const databaseAccess = require('./database/databaseAccessLayer');
const port = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
const dbUtils = require('./database/db_utils');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const expireTime = 60*1000;

success = dbUtils.printMySQLVersion();


const mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@assignment2.n6gwacu.mongodb.net/sessions?authSource=admin&appName=assignment2`,
    collectionName: 'sessions',
    ttl: expireTime,
    autoRemove: 'native'
});


app.use(session({
        secret: process.env.NODE_SESSION_SECRET,
        store: mongoStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: expireTime,
            secure: false
        }
    }
));



app.get('/', (req, res) => {
    res.render("landing") // Send to views/landing
});

app.get('/test-session', (req, res) => {
    req.session.testValue = "It works!";
    res.send("Session variable set! Check Atlas now.");
});

app.get('/login', (req, res) => {
    const invalid = req.query.invalid;
    res.render("login", {invalid: invalid});
})

app.get('/signup', (req, res) => {
    const invalid = req.query.invalid;
    res.render("signup", {invalid: invalid});
})

app.post('/loggingin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.redirect("/login?invalid=1");
    }

    try {
        const userFound = await databaseAccess.getUserByUsername(username);

        if (userFound && userFound.length > 0) {
            const match = await bcrypt.compare(password, userFound[0].password);

            if (match) {
                console.log("User authenticated successfully");
                req.session.authenticated = true;
                req.session.username = username;
                console.log("Session saved");

                req.session.save((err) => {
                    if (err) {
                        console.error("Session save error:", err);
                        return res.redirect("/login?invalid=1");
                    }
                    return res.redirect('/loggedIn');
                });
            } else {
                console.log("Passwords don't match");
                return res.redirect("/login?invalid=1");
            }
        } else {
            console.log("User not found in database");
            return res.redirect("/login?invalid=1");
        }
    } catch (err) {
        console.error("Database or Auth Error:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/loggedin', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
    }
    else {
        res.render("home", {username: req.session.username});
    }
})

app.post('/signingin', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        res.redirect("/signup?invalid=1")
    }

    const hashed_password = bcrypt.hashSync(password, saltRounds);

    console.log(username);
    console.log(password);

    var success = await databaseAccess.addUser({username: username, password: hashed_password});
    if (success) {
        console.log("Successfully created user")
    }

    res.redirect('/login')
})


app.get("*catchall", (req, res) => {
    res.status(404);
    res.render("404")
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});