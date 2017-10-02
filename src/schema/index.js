const { makeExecutableSchema } = require('graphql-tools')
const resolvers = require('./resolvers')

const typeDefs = `
  interface Node {
    id: ID!
  }

  type Link implements Node {
    id: ID!
    url: String!
    description: String!
    postedBy: User
    votes: [Vote!]!
  }
  
  type Vote implements Node {
    id: ID!
    user: User!
    link: Link!
  }
  
  type User implements Node {
    id: ID!
    name: String!
    email: String
    votes: [Vote!]!
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
    allLinks(filter: LinkFilter, skip: Int, first: Int): [Link!]!
    allUsers: [User]!
  }
  
  type Mutation {
    createLink(url: String!, description: String!): Link
    createVote(linkId: ID!): Vote
    createUser(name: String!, authProvider: AuthProviderSignupData!): User
    signinUser(email:AUTH_PROVIDER_EMAIL): SigninPayload!
  }
  
  input LinkFilter {
    OR: [LinkFilter!]
    description_contains: String
    url_contains: String
  }
  
  type Subscription {
    Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
  }
  
  input LinkSubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }
  
  type LinkSubscriptionPayload {
    mutation: _ModelMutationType!
    node: Link
  }
  
  enum _ModelMutationType {
    CREATED
    UPDATED
    DELETED
  }
`

// Generate the schema object from your types definition.
module.exports = makeExecutableSchema({ typeDefs, resolvers })