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
const expireTime = 15*60*1000;

success = dbUtils.printMySQLVersion();


const mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@assignment2.n6gwacu.mongodb.net/sessions?authSource=admin&appName=assignment2`,
    collectionName: 'sessions',
    ttl: expireTime,
    autoRemove: 'native',
    crypto: {
        secret: process.env.MONGO_SESSION_SECRET
    }
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

function isValidSession(req) {
    return req.session.authenticated;

}

function sessionValidation(req, res, next) {
    if (!isValidSession(req)) {
        req.session.destroy();
        res.redirect('/login');
    }
    else {
        next();
    }
}

app.use('/loggedin', sessionValidation);

app.get('/loggedin', (req, res) => {
    if (!isValidSession(req)) {
        res.redirect('/login');
    }
    else {
        res.redirect('/loggedin/home');
    }
});

app.get('/loggedin/home', async (req, res) => {
    const foundUser = await databaseAccess.getUserByUsername(req.session.username);
    const roomData = await databaseAccess.getAllRoomDataForUserByID(foundUser[0].user_id);

    res.render("home", {username: req.session.username, numOfRooms: roomData.length, roomData: roomData});
});

app.get('/loggedin/create-room', async (req, res) => {
    let users = await databaseAccess.getAllUsers();
    const selectedUsers = await databaseAccess.getUserByUsername(req.session.username);
    const selectedUserID = selectedUsers[0].user_id;

    res.render("create-room", {username: req.session.username, users: users, selectedUserID: selectedUserID});
});

app.post('/loggedin/creating-room', async (req, res) => {
    const selectedUsers = [].concat(req.body.usersToAdd || []);
    const roomName = req.body.roomName

    const result = await databaseAccess.createNewRoom(roomName);
    const newRoomID = result.insertId;

    if (selectedUsers.length > 0) {
        const values = selectedUsers.map(id => [newRoomID, id]);
        await databaseAccess.addUsersToRoom(values);
    }

    res.redirect('/loggedin/home');
});

app.get('/loggedin/room', async (req, res) => {
    const roomID = req.query.id;
    const room = await databaseAccess.getRoomByID(roomID);
    const roomUsers = await databaseAccess.getRoomUsersByRoomID(roomID);
    const currentUser = await databaseAccess.getUserByUsername(req.session.username);
    const roomMessages = await databaseAccess.getRoomMessages(roomID);
    const mostRecentMessage = roomMessages[roomMessages.length - 1];
    let userFound = null;

    console.log(roomID)
    console.log(roomMessages)
    console.log(mostRecentMessage);

    roomUsers.forEach((user) => {
        if (user.user_id === currentUser[0].user_id) {
            userFound = user.user_room_id;
        }
    });
    if (userFound) {
        if (mostRecentMessage) {
            await databaseAccess.resetUnreadMessages(userFound);
            console.log("Most recent message updated")
        }
        res.render("room", {room: room[0], username: req.session.username, messages: roomMessages});
    }
    else {
        res.redirect('/loggedin/unauthorized-room');
    }
});

app.get('/loggedin/invite-users', async (req, res) => {
   const roomID = req.query.id;
   const usersNotInRoom = await databaseAccess.getUsersNotInRoom(roomID);

   res.render("invite-users", {roomID: roomID, username: req.session.username, users: usersNotInRoom});
});

app.post('/loggedin/inviting', async (req, res) => {
   const roomID = req.query.id;
   const selectedUsers = [].concat(req.body.usersToAdd || []);

    if (selectedUsers.length > 0) {
        const values = selectedUsers.map(id => [roomID, id]);
        await databaseAccess.addUsersToRoom(values);
    }

    res.redirect("/loggedin/room?id=" + roomID);
});

app.get('/loggedin/unauthorized-room', (req, res) => {
   res.render("unauthorized-room", {username: req.session.username});
});

app.post('/loggedin/send-message', async (req, res) => {
    const message = req.body.message;
    const currentUser = await databaseAccess.getUserByUsername(req.session.username);
    const roomID = req.query.id;
    const userRoom = await databaseAccess.getUserRoomID(roomID, currentUser[0].user_id);

    await databaseAccess.sendMessage(userRoom[0].user_room_id, message);
    await databaseAccess.updateUnreadMessages(roomID, currentUser[0].user_id)

    res.redirect("/loggedin/room?id=" + roomID);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.post('/signingin', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        res.redirect("/signup?invalid=1")
    }

    const hashed_password = bcrypt.hashSync(password, saltRounds);

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