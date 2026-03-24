const database = include('database/databaseConnection');


async function getAllUsers() {
    
    let sqlQuery = `
		SELECT user_id, username, password
		FROM user;
	`;

    try {
        const results = await database.execute(sqlQuery);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log("Error selecting from users table");
        console.log(err);
        return null;
    }
}

async function getUserById(userID) {
    let sqlQuery = `
		SELECT user_id, username, password
		FROM user
		WHERE user_id = ?;
	`;

    try {
        const results = await database.execute(sqlQuery, [userID]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error selecting specific user ${userID}`);
        console.log(err);
        return null;
    }
}

async function getUserByUsername(username) {
    
    let sqlQuery = `
		SELECT user_id, username, password
		FROM user
		WHERE username = ?;
	`;

    try {
        const results = await database.execute(sqlQuery, [username]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error selecting specific user ${username}`);
        console.log(err);
        return null;
    }
}

async function addUser(postData) {
    
    let sqlInsert = `
		INSERT INTO user (username, password) 
		VALUES (?, ?);
	`;
    console.log(sqlInsert);
    try {
        const results = await database.execute(sqlInsert, [postData.username, postData.password]);
        console.log({results});
        console.log(`Inserted new row with id: ${results[0].insertId}`);

        return true;
    }
    catch (err) {
        console.log(err);

        return false;
    }
}

async function createNewRoom(roomName, userIDs) {
    let sqlQuery = `
        INSERT INTO room (name)
        VALUES
        (?)
    `;
    try {
        const results = await database.execute(sqlQuery, [roomName]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error creating room ${roomName}`);
        console.log(err);
        return null;
    }
}

async function addUsersToRoom(values) {
    let sqlQuery = `
        INSERT INTO user_room (room_id, user_id) VALUES ?
        `

    try {
        const results = await database.query(sqlQuery, [values]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error entering users into user room ${values}`);
        console.log(err);
        return null;
    }
}

async function getAllRoomsForUserByID(userID) {
    let sqlQuery = `
		SELECT room.room_id, room.name
        FROM room
                 JOIN user_room ON user_room.room_id = room.room_id
                 JOIN user ON user.user_id = user_room.user_id
        WHERE user.user_id = ?;
	`;

    try {
        const results = await database.execute(sqlQuery, [userID]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error selecting rooms for user ${userID}`);
        console.log(err);
        return null;
    }
}

module.exports = {getAllUsers, addUser, getUserById, createNewRoom, addUsersToRoom, getAllRoomsForUserByID, getUserByUsername}