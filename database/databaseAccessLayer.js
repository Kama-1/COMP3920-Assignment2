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

async function sendMessage(user_id, content) {
    let sqlQuery = `
        INSERT INTO message
            (user_room_id, send_time, content)
        VALUES
            (?, NOW(), ?);
	`;

    try {
        const results = await database.execute(sqlQuery, [user_id, content]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error sending message ${content}`);
        console.log(err);
        return null;
    }
}

async function getRoomMessages(roomID) {
    let sqlQuery = `
        SELECT m.message_id, m.user_room_id, m.send_time, m.content, u.user_id, u.username
        FROM message m
                 JOIN user_room ur ON ur.user_room_id = m.user_room_id
                 JOIN room r ON r.room_id = ur.room_id
                 JOIN user u ON ur.user_id = u.user_id
        WHERE r.room_id = ?
        ORDER BY m.send_time ASC;
	`;

    try {
        const results = await database.execute(sqlQuery, [roomID]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error loading messages for room ${roomID}`);
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

async function getRoomByID(roomID) {
    let sqlQuery = `
		SELECT room.room_id, room.name
        FROM room
        WHERE room.room_id = ?;
	`;

    try {
        const results = await database.execute(sqlQuery, [roomID]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error finding room ${roomID}`);
        console.log(err);
        return null;
    }
}

async function getRoomUsersByRoomID(roomID) {
    let sqlQuery = `
		SELECT user_id
        FROM user_room
        WHERE room_id = ?;
	`;

    try {
        const results = await database.execute(sqlQuery, [roomID]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error finding room users in ${roomID}`);
        console.log(err);
        return null;
    }
}

async function getUsersNotInRoom(roomID) {
    let sqlQuery = `
        SELECT user.user_id, user.username
        FROM user
        WHERE user_id NOT IN (SELECT user_id
                              FROM user_room
                              WHERE room_id = ?);
    `;
    try {
        const results = await database.execute(sqlQuery, [roomID]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error finding users not in room ${roomID}`);
        console.log(err);
        return null;
    }
}

async function getRoomDataForUser(roomID, userID) {
    let sqlQuery = `
		SELECT user_room_id, last_read_message_id, unread_message_count
        FROM user_room
        WHERE room_id = ?
		AND user_id = ?
	`;

    try {
        const results = await database.execute(sqlQuery, [roomID, userID]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error finding user ${userID} in room ${roomID}`);
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

module.exports = {
    getAllUsers,
    addUser,
    getUsersNotInRoom,
    getRoomByID,
    getRoomDataForUser,
    getRoomUsersByRoomID,
    createNewRoom,
    addUsersToRoom,
    getAllRoomsForUserByID,
    getUserByUsername,
    getRoomMessages,
    sendMessage
}