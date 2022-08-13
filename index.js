const socketio = require('socket.io')
const express = require('express')
const http = require('http')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
app.use(cors())

let usersOnline = []

const addUserOnline = (userId, socketId) => {
    !usersOnline.some(user => user.userId === userId) &&
        usersOnline.push({userId, socketId})
}

const removeUserOnline = (socketId) => {
    usersOnline = usersOnline.filter(user => user.socketId !== socketId)
}

const getUser = (userId) => {
    return usersOnline.find(user => user.userId === userId)
}

io.on("connection", (socket) => {

    socket.on("addUserOnline", (userId) => {
        addUserOnline(userId, socket.id)
        io.emit("getUsersOnline", usersOnline)
    })

    socket.on("sendMessage", ({senderId, receiverId, text, createAt}) => {
        const user = getUser(receiverId)
        io.to(user.socketId).emit("getMessage" , {
            senderId,
            text,
            createAt
        })
    })

    socket.on("disconnect", () => {
        removeUserOnline(socket.id)
        io.emit("getUsersOnline", usersOnline)
    })
})