const { v4 } = require('uuid')
const { 
  createUser, 
  findUsersInChat,
  updateUser,
  createMessage
} = require('./queries')

const createUserNewChat = async ({username}) => {
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

const findAndJoinChat = async (chatId, username) => {
  const data = await checkChatExists(chatId)
  if (data.status === 'error') {
    return data
  }
  if (data.filter(u => u.username === username).length > 0) {
    return createErrorObject('Username taken')
  }
  const result = await createUser({
    username,
    chatId,
  })
  if (result && result._id) {
    return {
      username: result.username,
      chatId: result.chatId
    }
  } else {
    return createErrorObject('Chat does not exist')
  }
}

const getUsersInChat = async (chatId) => {
  const users = await findUsersInChat(chatId);
  if (!users) {
    return createErrorObject(`Chat with Id ${chatId} not found`)
  }
  return users;
}

const updateUserWithSocketId = async ({username, chatId, socketId}) => {
  const result = updateUser({username, chatId, socketId})
  return result
}

const saveMessage = async ({username, chatId, content}) => {
  const result = await createMessage({username, chatId, content })
  if (result && result._id) {
    return result
  } else {
    return createErrorObject('Unable to create chat')
  }
}

const createErrorObject = (message) => {
  return {status: 'error', message }
}

module.exports = {
  createUserNewChat,
  checkChatExists,
  findAndJoinChat,
  getUsersInChat,
  updateUserWithSocketId,
  saveMessage
}
