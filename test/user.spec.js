const { v4 } = require('uuid')
const mongoose = require('mongoose')
const { userSchema } = require('../dao/schemas')
const { createUser, findOneUserInChat, findUsersInChat } = require('../dao/queries')

describe('User CRUD', () => {
  let User;
  let chatId;
  let userOneName = 'testdeb'

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  })

  afterAll(async () => {
    await User.collection.drop()
    await mongoose.disconnect()
  })

  it('insert one User', async () => {
    User = mongoose.model('User', userSchema)

    chatId = v4()

    let userOne = {
      username: userOneName,
      chatId,
      socketId: v4()
    }

    const result = await createUser(userOne)

    expect(result.username).toBe(userOne.username)
    expect(result._id).toBeDefined()
  })

  it('find users in chat', async () => {
    User = mongoose.model('User', userSchema)

    let userTwo = {
      username: 'testbob',
      chatId,
      socketId: v4()
    }

    await createUser(userTwo)

    const users = await findUsersInChat(chatId)

    expect(users.length).toBe(2)
    expect(users[1].chatId).toBe(chatId)
  })

  it('find one user in chat', async () => {
    const user = await findOneUserInChat(userOneName, chatId)

    expect(user.username).toBe(userOneName)
    expect(user._id).toBeDefined
  })
})
