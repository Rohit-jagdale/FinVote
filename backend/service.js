const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 4000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/your_database_name', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Could not connect to MongoDB', error));

// Define a Mongoose schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    adharNumber: String,
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoint to add user
app.post('/', async (req, res) => {
    const { firstName, lastName, age, adharNumber } = req.body;

    try {
        const newUser = new User({ firstName, lastName, age, adharNumber });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// API Endpoint to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
