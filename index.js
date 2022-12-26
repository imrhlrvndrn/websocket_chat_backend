require('dotenv').config();
const cors = require('cors');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cookieParser = require('cookie-parser');

// Config
const { connectDb } = require('./config/db.config');

// Middlewares
const { errorMiddleware } = require('./middlewares/error.middleware');

// Services
const { configureCloudinary } = require('./services/cloudinary.service');

// Routes
const { authRoutes } = require('./routes/auth.route');
const { userRoutes } = require('./routes/user.route');
const { chatRoutes } = require('./routes/chat.route');
const { messageRoutes } = require('./routes/message.route');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    pingTimeout: 60000,
    cors: {
        credentials: true,
        origin: 'http://localhost:3000',
    },
});
const port = process.env.PORT || 4000;

connectDb();
configureCloudinary();

// Express Middlewares
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.get('/', (req, res) => {
    console.log('Request =>', req);
    // res.redirect('http://localhost:3000');
    res.status(200).send('Hello world');
});

app.use(errorMiddleware);

server.listen(port, () => console.log(`Server is running  port ${port}`));

io.on('connection', (socket) => {
    console.log('connected to socket.io');

    // socket.on('user initialization', (user_data) => {
    //     console.log('user initialization is in progress');
    //     socket.join(user_data._id);
    //     socket.emit('user initialized');
    //     console.log('user initialization is in progress 2');
    // });

    socket.on('join chat', (room) => {
        console.log('Room ID [join chat] => ', room);
        socket.join(room);
        console.log(`User joined a chat ${room}`);
    });

    socket.on('new message', (new_message) => {
        console.log('got a new message from client => ', new_message);
        socket.to(new_message.chat._id.toString()).emit('receive message', new_message);
    });
});
