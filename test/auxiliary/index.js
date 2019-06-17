// third-party dependencies
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose')

// constant
const TEST_DB = 'mongoose-make-status-test-db'
const TEST_DB_URI = 'mongodb://localhost:27017/mongoose-make-status-test-db'

// set mongoose to debug mode
if (process.env.DEBUG === 'TRUE') {
  mongoose.set('debug', true);
}

const setupMongoClient = () => {
  return MongoClient.connect(TEST_DB_URI).then(client => {
    const db = client.db(TEST_DB)
    return db.dropDatabase().then(() => ({
      db,
      mongoDbClient: client
    }))
  })
}

const setupMongoose = (mongodbUri = TEST_DB_URI) => {
  return new Promise((resolve, reject) => {
    const connection = mongoose.createConnection(mongodbUri, { useNewUrlParser: true })

    const _resolve = () => {
      connection.removeListener('open', _resolve)
      resolve({
        mongooseConnection: connection
      })
    }

    const _reject = err => {
      connection.removeListener('error', _reject)
      reject(err)
    }

    connection.on('open', _resolve)
    connection.on('error', _reject)
  })
}


const setup = () => {
  return Promise.all([
    setupMongoClient(),
    setupMongoose()
  ])
  .then(([mongoClientAssets, mongooseAssets]) => {
    return Object.assign({}, mongoClientAssets, mongooseAssets)
  })
}

const teardown = assets => {
  return Promise.all([
    assets.db.dropDatabase().then(() => assets.mongoDbClient.close()),
    assets.mongooseConnection.close()
  ])
  .then(() => {})
}

module.exports = {
  TEST_DB,
  TEST_DB_URI,
  setup,
  teardown,
}
