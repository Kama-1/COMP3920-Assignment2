require('dotenv').config();

const express = require('express');
const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("landing") // Send to views/landing
});



app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});