require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let User; // Will be defined after initializing the connection

// Define the user schema
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    loginHistory: [
        {
            dateTime: {
                type: Date,
                required: true
            },
            userAgent: {
                type: String,
                required: true
            }
        }
    ]
});

// Initialize the connection to MongoDB
function initialize() {
    return new Promise((resolve, reject) => {
        console.log("MONGODB connection string:", process.env.MONGODB);

        mongoose.connect(process.env.MONGODB)
            .then(() => {
                User = mongoose.model("users", userSchema);
                console.log("Connected to MongoDB Atlas!");
                resolve();
            })
            .catch(err => {
                console.error("Error connecting to MongoDB Atlas:", err);
                reject(err);
            });
    });
}

// Register a new user
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }

        bcrypt.hash(userData.password, 10)
            .then(hash => {
                userData.password = hash;

                const newUser = new User(userData);
                newUser.save()
                    .then(() => resolve())
                    .catch(err => {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject("There was an error creating the user: " + err.message);
                        }
                    });
            })
            .catch(err => {
                reject("There was an error encrypting the password: " + err.message);
            });
    });
}

// Check user credentials
function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then(user => {
                if (!user) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, user.password)
                        .then(result => {
                            if (!result) {
                                reject("Incorrect Password for user: " + userData.userName);
                            } else {
                                if (user.loginHistory.length === 8) {
                                    user.loginHistory.pop();
                                }

                                user.loginHistory.unshift({
                                    dateTime: new Date(),
                                    userAgent: userData.userAgent
                                });

                                user.save()
                                    .then(() => resolve(user))
                                    .catch(err => {
                                        reject("There was an error updating login history: " + err.message);
                                    });
                            }
                        })
                        .catch(err => {
                            reject("There was an error verifying the user: " + err.message);
                        });
                }
            })
            .catch(err => {
                reject("Unable to find user: " + err.message);
            });
    });
}

module.exports = {
    initialize,
    registerUser,
    checkUser
};
