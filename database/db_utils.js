const database = include('database/databaseConnection');

async function printMySQLVersion() {
    let sqlQuery = `
		SHOW VARIABLES LIKE 'version';
	`;

    try {
        const results = await database.query(sqlQuery);
        console.log("Successfully connected to MySQL");
        console.log(results[0]);
        return Promise.resolve(200);
    }
    catch(err) {
        console.log("Error getting version from MySQL");
        console.log(err);
        return Promise.reject(new Error(400));
    }
}

module.exports = {printMySQLVersion};