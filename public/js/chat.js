const sock = new SockJS('https://qw3rt.ochsec1.repl.co/chat')
//const sock = new SockJS('http://localhost:9999/chat')
const copyIdBtn = document.getElementById('copy-id-btn')
const copiedNotice = document.getElementById('copied-notice')
const listGroup = document.getElementById('chat-window-list-group')
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
        } else {
            messages = data.content
            messages.forEach(msg => appendMessageList(msg))
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
    
    if (data.event === 'broadcast') {
        messages.push(data)
        appendMessageList(data)
    }
}

const onCopyIdClicked = () => {
    copiedNotice.style.visibility = 'visible'
    navigator.clipboard.writeText(chatId)
    setTimeout(() => {
        copiedNotice.style.visibility = 'hidden'
    }, 1000)
}

const appendMessageList = (msg) => {
    let date = new Date(msg.createdAt)
    let grpItem = document.createElement('a')
    let grpItemDiv = document.createElement('div')
    let grpItemHeader = document.createElement('h5')
    let grpItemSmall = document.createElement('small')
    let grpItemPara = document.createElement('p')
    grpItem.setAttribute('class', 'list-group-item list-group-item-action')
    grpItemDiv.setAttribute('class', 'd-flex w-100 justify-content-between')
    grpItemHeader.setAttribute('class', 'mb-1')
    grpItemPara.setAttribute('class', 'mb-1')

    grpItemSmall.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    grpItemHeader.textContent = msg.username
    grpItemPara.textContent = msg.content

    grpItemDiv.appendChild(grpItemHeader)
    grpItemDiv.appendChild(grpItemSmall)
    grpItem.appendChild(grpItemDiv)
    grpItem.appendChild(grpItemPara)

    listGroup.appendChild(grpItem)
}

const onSendClicked = () => {
    if (message.value === '' || message.value.length === 0) {
        return
    }

    const sendData = {
        event: 'message',
        username,
        chatId,
        content: message.value,
        token,
        socketId
    }    

    sock.send(JSON.stringify(sendData))

    message.value = ''
}

document.addEventListener('DOMContentLoaded', checkForSessionVariables)
copyIdBtn.addEventListener('click', onCopyIdClicked)
sendBtn.addEventListener('click', onSendClicked)
