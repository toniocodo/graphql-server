const express = require('express')
const bodyParser = require('body-parser')
const { execute, subscribe } = require('graphql')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { createServer } = require('http')
const { fs } = require('fs')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const cors = require('cors')

const schema = require('./schema')
const connectMongo = require('./mongo-connector')
const { authenticate } = require('./authentication')
const buildDataloaders = require('./dataloaders')
const formatError = require('./formatError')

const start = async () => {
  const mongo = await connectMongo()
  const app = express()
  const PORT = 4000;
  const schemaInfos = {
    generate: false,
    path: './schema/'
  }

  // Cors
  app.use(cors())

  // Context creation
  const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users)
    return {
      context: {
        dataLoaders: buildDataloaders(mongo),
        mongo,
        user,
      },
      formatError,
      schema
    }
  }
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions))

  // Graphiql
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'bearer token-toniocodo@hotmail.com'`,
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
  }));

  if (schemaInfos && schemaInfos.generate) {
    // Save json schema
    graphql(schema, introspectionQuery).then(result => {
      fs.writeFileSync(
        `${generatedSchemaPath}/schema.json`,
        JSON.stringify(result, null, 2)
      )
    })

    // Save user readable type system shorthand of schema
    fs.writeFileSync(
      `./readable.graphql`,
      printSchema(schema)
    )
  }

  const server = createServer(app);
  server.listen(PORT, () => {
    SubscriptionServer.create(
      {execute, subscribe, schema},
      {server, path: '/subscriptions'},
    );
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
}

start()