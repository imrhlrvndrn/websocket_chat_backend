require('dotenv').config();
const cors = require('cors');
const express = require('express');
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
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    console.log('Request =>', req);
    // res.redirect('http://localhost:3000');
    res.status(200).send('Hello world');
});

app.use(errorMiddleware);

app.listen(port, () => console.log(`Server is running  port ${port}`));
