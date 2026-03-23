//Define the include function for absolute file name
global.base_dir = __dirname;
global.abs_path = function(path) {
    return base_dir + path;
}
global.include = function(file) {
    return require(abs_path('/' + file));
}

require('dotenv').config();

const express = require('express');
const {printMySQLVersion} = require("./database/db_utils");
const databaseAccess = require('./database/databaseAccessLayer');
const port = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const database = include('database/databaseConnection');
let success = include('database/db_utils');

success = printMySQLVersion()


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

// TODO put async when db is added
app.post('/loggingin', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    if (!username || !password) {
        res.redirect("/login?invalid=1")
    }

    // TODO check that user is valid
    res.redirect('/loggedIn')
})

app.post('/signingin', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    if (!username || !password) {
        res.redirect("/signup?invalid=1")
    }

    var success = await databaseAccess.addUser({username: username, password: password});
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