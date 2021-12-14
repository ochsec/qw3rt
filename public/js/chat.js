//const sock = new SockJS('https://qw3rt.ochsec1.repl.co/chat')
const sock = new SockJS('http://localhost:9999/chat')
const message = document.getElementById('message')
const sendBtn = document.getElementById('send-btn')

let messages = []
let username, chatId, token, socketId

const checkForSessionVariables = async () => {
    const urlSplit = window.location.href.split('/')
    const chatIdFromUrl = urlSplit[urlSplit.length - 1]
    username = sessionStorage.getItem('username')
    chatId = sessionStorage.getItem('chatId')
    token = sessionStorage.getItem('token')

    if (!username || !token) {
        window.location.href = '/'
    }

    if (!chatId || (chatId !== chatIdFromUrl)) {
        window.location.href = '/'
    }

    // Todo: Verify user
    fetch(`/${chatId}`, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            chatId,
            token
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'error') {
            window.location.href = '/'
        }
    })
}

sock.onopen = () => {
    const urlFrags = sock._transport.url.split('/')
    socketId = urlFrags[urlFrags.length - 2]
    const sendData = {
        event: 'session',
        username,
        chatId,
        message: 'Inform socket session id',
        token,
        socketId
    }

    sock.send(JSON.stringify(sendData))
}
sock.onclose = () => console.log('Websocket connection closed')

sock.onmessage = (e) => {
    const data = JSON.parse(e.data)
    console.log(data)
    messages.push(data)
    console.log('Build message component')
}

const onSendClicked = () => {
    if (message.value === 0) {
        return
    }

    const sendData = {
        event: 'message',
        username,
        chatId,
        message: message.value,
        token,
        socketId
    }    

    sock.send(JSON.stringify(sendData))
}

document.addEventListener('DOMContentLoaded', checkForSessionVariables)
sendBtn.addEventListener('click', onSendClicked)
