const DataLoader = require('dataloader')

const cacheKeyFn = key => key.toString()

async function batchUsers(Users, keys) {
  return await Users.find({ _id: { $in: keys } }).toArray()
}

async function batchLinks(Links, keys) {
  return await Links.find({ _id: { $in: keys } }).toArray()
}

// async function batchVotes(Votes, keys) {
//   return await Votes.find({ _id: { $in: keys } }).toArray()
// }
//
// async function batchVotesByUser(Votes, keys) {
//   return await Votes.find({ userId: { $in: keys } }).toArray()
// }
//
// async function batchVotesByLink(Votes, keys) {
//   return await Votes.find({ linkId: { $in: keys } }).toArray()
// }

module.exports = ({ Users, Links, Votes }) => ({
  userLoader: new DataLoader(
    keys => batchUsers(Users, keys),
    { cacheKeyFn },
  ),
  linkLoader: new DataLoader(
    keys => batchLinks(Links, keys),
    { cacheKeyFn }
  ),
  // voteLoader: new DataLoader(
  //   keys => batchVotes(Votes, keys),
  //   { cacheKeyFn }
  // ),
  // voteByUserLoader: new DataLoader(
  //   keys => batchVotesByUser(Votes, keys),
  //   { cacheKeyFn }
  // ),
  // voteByLinkLoader: new DataLoader(
  //   keys => batchVotesByLink(Votes, keys),
  //   { cacheKeyFn }
  // ),
})
