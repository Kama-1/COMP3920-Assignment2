const database = include('database/databaseConnection');

async function getAllUsers() {
    let sqlQuery = `
		SELECT user_id, username, password
		FROM user;
	`;

    try {
        const results = await database.query(sqlQuery);
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
		WHERE user_id = ${userID};
	`;

    try {
        const results = await database.query(sqlQuery);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error selecting specific user ${userID}`);
        console.log(err);
        return null;
    }
}

async function addUser(postData) {
    let sqlInsert = `
		INSERT INTO user (username, password) 
		VALUES (:username, :password);
	`;
    let params = {
        username: postData.username,
        password: postData.password
    };
    console.log(sqlInsert);
    try {
        const results = await database.query(sqlInsert, params);
        console.log({results});
        console.log(`Inserted new row with id: ${results[0].insertId}`);

        return true;
    }
    catch (err) {
        console.log(err);

        return false;
    }
}

async function getAllGroupsForUserByID(userID) {
    let sqlQuery = `
		SELECT room_id, name
        FROM room
                 JOIN user_room ON user_room.room_id = room.room_id
                 JOIN user ON user.user_id = user_room.user_id
        WHERE user.user_id = ${userID};
	`;

    try {
        const results = await database.query(sqlQuery);
        console.log(results[0]);
        return results[0];
    }
    catch (err) {
        console.log(`Error selecting rooms for user ${userID}`);
        console.log(err);
        return null;
    }
}

module.exports = {getAllUsers, addUser, getUserById, getAllGroupsForUserByID}