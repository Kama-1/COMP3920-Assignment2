require('dotenv').config();

const express = require('express');
const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render("landing") // Send to views/landing
});

app.get('/login', (req, res) => {
    res.render("login")
})

app.get('/signup', (req, res) => {
    res.render("signup")
})

// TODO put async when db is added
app.post('/loggingin', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    // TODO check that user is valid
    res.redirect('/loggedIn')
})

// TODO put async when db is added
app.post('/signingin', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

    // TODO add user
    res.redirect('/login')
})


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});