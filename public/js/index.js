const username = document.getElementById('username')
const invalidUsername = document.getElementById('invalid-username')
const chatId = document.getElementById('chat-id')
const invalidChatId = document.getElementById('invalid-chat-id')
const joinBtn = document.getElementById('join-btn')
const createBtn = document.getElementById('create-btn')

const usernameIsValid = () => {
  if (!username.textContent) {
    invalidUsername.textContent = 'Please choose a username'
    invalidUsername.style.visibility = 'visible'
    return false
  }
  return true
}
const chatIdIsValid = () => {
  if (!chatId.textContent) {
    invalidChatId.textContent = 'Please enter the chat id'
    invalidChatId.style.visibility = 'visible'
    return false
  }
  return true
}
const onUsernameChange = (e) => {
  invalidUsername.style.visibility = 'hidden'
  username.textContent = e.target.value
}
const onChatIdChange = (e) => {
  invalidChatId.style.visibility= 'hidden'
  chatId.textContent = e.target.value
}
const onJoinClicked = async () => {
  const uValid = usernameIsValid()
  const cValid = chatIdIsValid()
  if (!uValid || !cValid) return

  fetch('/join', {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username.textContent,
      chatId: chatId.textContent
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      sessionStorage.setItem('username', data.username)
      sessionStorage.setItem('chatId', data.chatId)
      sessionStorage.setItem('token', data.token)
      window.location.href = `/${data.chatId}`
    } else if (data.status === 'error') {
      invalidUsername.textContent = data.message
      invalidUsername.style.visibility = 'visible'
    } else { 
        console.log(data)
    }
  })
  .catch(error => console.log(error))
}

const onCreateClicked = async () => {
  if (!usernameIsValid()) return
  fetch('/create', {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        username: username.textContent
      })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      sessionStorage.setItem('username', data.username)
      sessionStorage.setItem('chatId', data.chatId)
      sessionStorage.setItem('token', data.token)
      window.location.href = `/${data.chatId}`
    } else if (data.status === 'error') { 
      invalidUsername.textContent = data.message
      invalidUsername.style.visibility = 'visible'
    } else {
      console.log(data)
    }
  })
  .catch(error => console.log(error))
}

username.addEventListener('input', onUsernameChange)
chatId.addEventListener('input', onChatIdChange)
joinBtn.addEventListener('click', onJoinClicked)
createBtn.addEventListener('click', onCreateClicked)
