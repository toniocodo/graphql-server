const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')

const schema = require('./schema')
const connectMongo = require('./mongo-connector')
const { authenticate } = require('./authentication')
const buildDataloaders = require('./dataloaders')

const start = async () => {
  const mongo = await connectMongo()
  const app = express()

  // Context creation
  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users)
    return {
      context: {
        dataLoaders: buildDataloaders(mongo),
        mongo,
        user,
      },
      schema
    }
  }
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions))

  // Graphiql
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'bearer token-toniocodo@hotmail.com'`
  }))

  const PORT = 3000
  app.listen(PORT, () => {
    console.log(`GraphQL server running on port ${PORT}.`)
  })
}

start()