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

success = dbUtils.printMySQLVersion()


app.get('/', (req, res) => {
    res.render("landing") // Send to views/landing
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
    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    if (!username || !password) {
        res.redirect("/login?invalid=1")
    }

    var userFound = await databaseAccess.getUserByUsername(username);
    if (userFound.length === 0) {
        let match = bcrypt.compare(password, userFound[0].password)
        if (!match) {
            console.log("Passwords dont match")
            res.redirect("/login?invalid=1")
        }
        res.redirect("/login?invalid=1")
    }
    else {
        console.log("User found")
        res.redirect('/loggedIn')
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