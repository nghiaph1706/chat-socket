const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

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
    console.log(socket.id + "connected")
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
