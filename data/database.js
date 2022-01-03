const mongodb = require('mongodb');

// MongoClient is the actual package required to make the connection
const MongoClient = mongodb.MongoClient;

let database;

async function connect () {
    // Creating database connection will take a while - hence it is an asynchronous code and returns a promise
    // to hault further code execution till this is done, we use async - await
    // client will make the connection to mongodb server
    const client = await MongoClient.connect('mongodb://localhost:27017');
    // database will use the db method to connect to a specific database - blog db in below case
    database = client.db('blog');
}

function getDB() {
    // throw error if database doesn't exists, else return the database
    if (!database) {
        throw {message: 'Database connection not established'};
    }
    return database;
}

// This connection will be used in app.js
module.exports = {
    // key: Value
    // Not adding () to function name so they don't get executed
    connectToDatabse: connect,
    getDB: getDB
};