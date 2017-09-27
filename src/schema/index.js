const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
  }
  
  type User {
    id: ID!
    name: String!
    email: String
  }
  
  input AuthProviderSignupData {
    email: AUTH_PROVIDER_EMAIL
  }
  
  input AUTH_PROVIDER_EMAIL {
    email: String!
    password: String!
  }
  
  type SigninPayload {
    token: String
    user: User
  }
  
  type Query {
    allLinks: [Link!]!
    allUsers: [User]!
  }
  
  type Mutation {
    createLink(url: String!, description: String!): Link
    createUser(name: String!, authProvider: AuthProviderSignupData!): User
    signinUser(email:AUTH_PROVIDER_EMAIL): SigninPayload!
  }
`

// Generate the schema object from your types definition.
module.exports = makeExecutableSchema({ typeDefs, resolvers })