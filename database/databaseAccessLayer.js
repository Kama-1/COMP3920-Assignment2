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
		SELECT user_id, user_room_id
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



async function getAllRoomDataForUserByID(userID) {
    let sqlQuery = `
        SELECT
            r.room_id,
            r.name,
            ur.user_room_id,
            lm.content AS last_message_content,
            lm.send_time AS last_message_send_time,
            lm.username as last_message_sender,
            ur.unread_message_count
        FROM room r
                 JOIN user_room ur ON ur.room_id = r.room_id
                 JOIN user u ON u.user_id = ur.user_id
                 LEFT JOIN (
            SELECT m1.content, m1.send_time, mur.room_id, ulm.username
            FROM message m1
                     JOIN user_room mur ON mur.user_room_id = m1.user_room_id
                     JOIN user ulm ON ulm.user_id = mur.user_id
            WHERE m1.send_time = (
                SELECT MAX(m2.send_time)
                FROM message m2
                         JOIN user_room mur2 ON mur2.user_room_id = m2.user_room_id
                WHERE mur2.room_id = mur.room_id
            )
        ) AS lm ON lm.room_id = r.room_id
        WHERE u.user_id = ?;
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

async function updateMostRecentMessage(messageID, userRoomID) {
    let sqlQuery = `
        UPDATE user_room
        SET last_read_message_id = ?
        WHERE user_room_id = ?;
	`;

    try {
        const results = await database.execute(sqlQuery, [messageID, userRoomID]);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error updating most recent message ${messageID} for user ${userID}`);
        console.log(err);
        return null;
    }
}

module.exports = {
    getAllUsers,
    addUser,
    getUsersNotInRoom,
    getRoomByID,
    getRoomUsersByRoomID,
    createNewRoom,
    addUsersToRoom,
    getAllRoomDataForUserByID,
    getUserByUsername,
    getRoomMessages,
    sendMessage,
    updateMostRecentMessage
}