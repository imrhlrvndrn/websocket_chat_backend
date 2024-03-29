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
        origin: process.env.FRONTEND_URL,
    },
});
const port = process.env.PORT || 4000;

connectDb();
configureCloudinary();

// Express Middlewares
// app.set('Access-Control-Allow-Credentials', true);
// app.set('Access-Control-Allow-Headers', 'Content-Type');
// app.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
// app.set('Access-Control-Allow-Origin', process.env.BACKEND_URL);
app.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_URL,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.get('/', (req, res) => {
    res.status(200).send('Hello world');
});

app.use(errorMiddleware);

server.listen(port, () => console.log(`Server is running  port ${port}`));

io.on('connection', (socket) => {
    socket.on('join chat', (room) => {
        socket.join(room);
    });

    socket.on('new message', (new_message) => {
        socket.to(new_message.chat._id.toString()).emit('receive message', new_message);
    });
});
