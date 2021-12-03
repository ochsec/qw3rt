const { v4 } = require('uuid')
const { createUser } = require('./queries')

const createUserNewChat = async ({username,  socketId}) => {
  const chatId = v4()
  const result = await createUser({
    username,
    chatId,
    socketId,
  })
  if (result && result._id) {
    return result.chatId
  } else {
    return null
  }
}

module.exports = {
  createUserNewChat
}