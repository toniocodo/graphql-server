const { ObjectID } = require('mongodb')
const { URL } = require('url')
const pubsub = require('../pubsub')

class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.field = field
  }
}

function assertValidLink({ url }) {
  try {
    new URL(url)
  } catch (error) {
    throw new ValidationError('Link validation error: invalid url.', 'url')
  }
}

function buildFilters({ OR = [], description_contains, url_contains }) {
  const filter = (description_contains || url_contains) ? {} : null
  if (description_contains) {
    filter.description = { $regex: `.*${description_contains}.*` }
  }
  if (url_contains) {
    filter.url = { $regex: `.*${url_contains}.*` }
  }

  let filters = filter ? [filter] : []
  OR.forEach(f => filters = filters.concat(buildFilters(f)))
  return filters
}

module.exports = {
  Query: {
    allLinks: async (root, { filter, first, skip }, { mongo: { Links, Users } }) => {
      let query = filter ? { $or: buildFilters(filter) } : {}
      const cursor = Links.find(query)
      if (first) {
        cursor.limit(first)
      }
      if (skip) {
        cursor.skip(skip)
      }
      return cursor.toArray()
    },

    allUsers: async (root, data, { mongo: { Users } }) => {
      return await Users.find({}).toArray()
    },
  },

  Mutation: {
    createLink: async (root, data, { mongo: { Links }, user }) => {
      assertValidLink(data)
      const newLink = Object.assign({ postedById: user && user._id }, data)
      const response = await Links.insert(newLink)

      newLink.id = response.insertedIds[0]
      pubsub.publish('Link', { Link: { mutation: 'CREATED', node: newLink } })

      return newLink
    },

    createVote: async (root, data, { mongo: { Votes }, user }) => {
      const newVote = {
        userId: user && user._id,
        linkId: new ObjectID(data.linkId),
      }
      const response = await Votes.insert(newVote)
      return Object.assign({ id: response.insertedIds[0] }, newVote)
    },

    createUser: async (root, data, { mongo: { Users } }) => {
      const newUser = {
        name: data.name,
        email: data.authProvider.email.email,
        password: data.authProvider.email.password,
      }
      const response = await Users.insert(newUser)
      return Object.assign({ id: response.insertedIds[0] }, data)
    },

    signinUser: async (root, data, { mongo: { Users } }) => {
      const user = await Users.findOne({ email: data.email.email })
      if (data.email.password === user.password) {
        return { token: `token-${user.email}`, user }
      }
    },
  },

  Subscription: {
    Link: {
      subscribe: () => pubsub.asyncIterator('Link'),
    },
  },

  Link: {
    id: root => root._id || root.id,

    postedBy: async ({ postedById }, data, { dataLoaders: { userLoader } }) => {
      return await userLoader.load(postedById)
    },

    votes: async ({ _id }, data, { mongo: { Votes } }) => {
      return await Votes.find({ linkId: _id }).toArray()
    },
  },

  User: {
    id: root => root._id || root.id,

    votes: async ({ _id }, data, { mongo: { Votes } }) => {
      return await Votes.find({ userId: _id }).toArray()
    },
  },

  Vote: {
    id: root => root._id || root.id,

    user: async ({ userId }, data, { dataLoaders: { userLoader } }) => {
      return await userLoader.load(userId)
    },

    link: async ({ linkId }, data, { dataLoaders: { linkLoader } }) => {
      return await linkLoader.load(linkId)
    },
  },
}