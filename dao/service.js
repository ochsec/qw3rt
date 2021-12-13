const { v4 } = require('uuid')
const { 
  createUser, 
  findUsersInChat
} = require('./queries')

const createUserNewChat = async ({username,  socketId}) => {
  const chatId = v4()
  const result = await createUser({
    username,
    chatId,
  })
  if (result && result._id) {
    return { 
      username,
      chatId: result.chatId 
    }
  } else {
    return createErrorObject('Unable to create chat')
  }
}

const checkChatExists = async (chatId) => {
  const result = await findUsersInChat(chatId)
  if (result && result.length > 0) {
    return result
  } else {
    return createErrorObject('Chat does not exist')
  }
}

const findAndJoinChat = async (chatId, username, socketId) => {
  const users = await checkChatExists(chatId)
  if (!users) {
    return createErrorObject(`Chat with Id ${chatId} not found`)
  }
  if (users.filter(u => u.username === username).length > 0) {
    return createErrorObject('Username taken')
  }
  const result = await createUser({
    username,
    chatId,
    socketId,
  })
  return { event: 'join-success', chatId }
}

const getUsersInChat = async (chatId) => {
  const users = await findUsersInChat(chatId);
  if (!users) {
    return createErrorObject(`Chat with Id ${chatId} not found`)
  }
  return users;
}

const createErrorObject = (message) => {event: 'error', message }

module.exports = {
  createUserNewChat,
  checkChatExists,
  findAndJoinChat,
  getUsersInChat,
}
