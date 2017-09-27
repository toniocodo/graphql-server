const Engine = require('tingodb')()

module.exports = async () => {
  const db = new Engine.Db('/db/hackernews', {})
  return { Links: db.collection('links') }
}
