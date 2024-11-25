import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import session from 'express-session';
const app = express();
const port = process.env.PORT || 3000;
dotenv.config();
const saltRounds = process.env.SALT_ROUNDS;
app.use(
    session({
        secret: process.env.SECRET ,
        resave: false,  // Do not save session if it is unmodified
        saveUninitialized: true,  // Save uninitialized sessions
        cookie: {
            httpOnly: true,  // Prevents JavaScript from accessing cookies
            secure: true,  // Set to true if using HTTPS
            maxAge: 24 * 60 * 60 * 1000 * 4,  // 1 day for session expiration
        }
    })
);
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csvtojson';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API = process.env.API;
// database
mongoose.connect(`mongodb+srv://${process.env.MONGO_ME}:${process.env.MONGODB_PW}@${process.env.CLUSTER2}.cwige.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.CLUSTER}`)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(
    {
        credentials: true, origin: 'http://localhost:5173'
    }));
app.use(cookieParser());
app.use(express.json())
// server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

async function filmTitle() {
    var randNumber = Math.random() * 250;
    var index = Math.floor(randNumber);

    // Load the films
    // var films = await csv().fromFile("./IMDB Top 250 Movies.csv");
    const films = await csv().fromFile(path.join(__dirname, 'IMDB Top 250 Movies.csv'));
    return films[index].name;
};

async function film() {

    try {
        const movieTitle = await filmTitle();


        const response = await axios.get(`${API}/?apikey=${process.env.API_KEY}&t=${movieTitle}`);

        const data = response.data;

        return data;

    }
    catch (error) {

        console.error(error);

    }

}

const User = mongoose.model("User", {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    quizHistory: [{
        score: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
})

// Helper function to calculate final score
const calculateFinalScore = (quizHistory) => {
    const totalScore = quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = quizHistory.length ? totalScore / quizHistory.length : 0;

    // Formula components
    const quizCountFactor = Math.min(Math.log10(quizHistory.length + 1), 10); // Log factor for the number of quizzes
    const consistencyFactor = quizHistory.length >= 5 ?
        quizHistory.slice(-5).reduce((sum, quiz) => sum + quiz.score, 0) / 5 : averageScore; // Last 5 quizzes avg or overall average

    // Final score calculation based on the locked formula
    return (averageScore * 0.5) + (quizCountFactor * 0.3) + (consistencyFactor * 0.2);
};

app.get('/api/leaderboard', async (req, res) => {
    try {
        const { region, value } = req.query;

        // console.log(req.query);

        // Determine query filter based on region
        let query = {};
        if (region === 'city') {
            query = { city: value };
        } else if (region === 'state') { 
            query = { state: value };
        } else if (region === 'country') {
            query = {};
        } // No filter for 'country' since all users are from India

        const users = await User.find(query).lean();
        const leaderboard = users.map(user => ({
            name: user.name,
            email: user.email,
            score: calculateFinalScore(user.quizHistory),
            quizCount: user.quizHistory.length,
            averageScore: user.quizHistory.length
                ? user.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / user.quizHistory.length
                : 0,
            consistency: user.quizHistory.length >= 5
                ? user.quizHistory.slice(-5).reduce((sum, quiz) => sum + quiz.score, 0) / 5
                : user.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / user.quizHistory.length,
        }));

        // Sort and select top 10
        leaderboard.sort((a, b) => b.score - a.score);
        const top10 = leaderboard.slice(0, 10); 

        // console.log(top10);

        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        else {
            try {
                const decoded = jwt.verify(token, process.env.SECRET);
                let user = await User.findOne({ email: decoded.user.email });
                // console.log(user);
                if (user == null) {
                    res.cookie('token', '', {
                        expires: new Date(0), httpOnly: true
                    });
                    return res.status(401).json({
                        success: false,
                        message: "Unauthorized"
                    });
                }
                else {
                    const userRank = leaderboard.findIndex(l => l.email === user.email); //index
                    const userInfo = leaderboard[userRank]; // leaderboard info
                    // console.log(userInfo)
                    return res.status(200).json({
                        success: true,
                        leaderboard: top10,
                        userRank: userRank + 1,
                        userInfo,
                    });
                }

            } catch (error) {
                console.error("Error verifying token:", error);
                res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                })
            }
        }

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the leaderboard"
        });
    }
});

// Endpoint to get quiz history
app.post('/api/quiz-history', async (req, res) => {
    try {
        // takiing the email from the frontend and then sending the quiz history 
        let email = req.body.userEmail;
        const user = await User.findOne({ email: email });
        // console.log("User in the get quiz history " + user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ quizHistory: user.quizHistory });
    } catch (error) {
        console.error('Error retrieving quiz history:', error);
        res.status(500).json({ error: 'An error occurred while retrieving quiz history.' });
    }
});

app.post('/register', async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({
                success: false,
                error: "User already exists with the same email"
            });
        }

        // Hash the password
        let pw = req.body.password;
        bcrypt.hash(pw, parseInt(saltRounds), async function (err, hash) {
            if (err) {
                return res.status(400).json({
                    success: false,
                    error: "Error hashing the password"
                });
            }

            // Create a new user with the hashed password
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash,  // hashed password is saved here
                state: req.body.state,
                city: req.body.city
            });

            // Save the new user to the database 
            await newUser.save();




            const authData =
            {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    state: newUser.state,
                    city: newUser.city,
                }
            }
            // Generate JWT token
            const authtoken = jwt.sign(authData, process.env.SECRET, { expiresIn: '24h' });

            // Set the token in an HTTP-only cookie
            res.cookie('token', authtoken, {
                httpOnly: true, // Prevent JavaScript from accessing the token
                secure: false,
                sameSite: 'strict', // Helps mitigate CSRF attacks
                maxAge: 3600000 * 24
            });

            res.status(200).json({
                success: true,
                message: "User created successfully"
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Something went wrong"
        });
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.status(200).json({ message: "Logout successful" });
})

app.post('/quiz', async (req, res) => {
    try {
        const shouldFetchQuote = Math.random().toFixed(2);
        req.session.qNumber = req.session.qNumber || 0;
        req.session.score = req.session.score || 0;
        req.session.qid = req.session.qid || 0;
        req.session.answer = req.session.answer || null;

        // If user has already answered 10 questions, return the "quiz complete" message
        // const user = await User.findOne({ email: req.body.userEmail });
        // console.log(user)
        if (req.session.qNumber >= 10) {
            const user = await User.findOne({ email: req.body.userEmail });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // saving the quiz history to the database
            user.quizHistory.push({
                score: req.session.score
            });
            await user.save();

            let score = req.session.score;
            req.session.destroy();
            return res.json({
                message: "Quiz round complete",
                score: score
            });
        }

        // Fetch a multiple-choice trivia question
        if (shouldFetchQuote <= 0.33 && shouldFetchQuote > 0) {
            try {
                const response = await fetch(process.env.API2);
                const temp = await response.json();

                // Check if 'results' exists and has at least one item
                if (!temp.results || temp.results.length === 0) {
                    console.error("No results from API.");
                    return res.status(500).json({ error: "No quiz data available." });
                }

                const triviaData = temp.results[0];
                const correctAnswer = triviaData.correct_answer;
                const incorrectAnswers = triviaData.incorrect_answers;
                const choices = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5); // Shuffle choices
                // cleaning the choices just like the question
                // removing stuff like &quot;, &amp;, &#039; from the choices array
                for (let i = 0; i < choices.length; i++) {
                    choices[i] = choices[i]
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, "&")
                        .replace(/&#039;/g, "'");
                }

                triviaData.question = triviaData.question
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, "&")
                    .replace(/&#039;/g, "'");

                const questionId = Date.now().toString();
                req.session.qid = questionId;
                req.session.answer = correctAnswer;
                req.session.qNumber += 1;

                res.json({
                    type: 'trivia',
                    question: triviaData.question,
                    questionId: questionId,
                    choices: choices,
                    qNumber: req.session.qNumber,
                    score: req.session.score
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ error: 'An error occurred while fetching trivia data.' });
            }
        }
        // Fetch a boolean trivia question
        else if (shouldFetchQuote <= 0.66 && shouldFetchQuote > 0.33) {
            try {
                const response = await fetch(process.env.API3);
                const temp = await response.json();

                // Check if 'results' exists and has at least one item
                if (!temp.results || temp.results.length === 0) {
                    console.error("No results from API.");
                    return res.status(500).json({ error: "No quiz data available." });
                }

                const triviaData = temp.results[0];
                triviaData.question = triviaData.question
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, "&")
                    .replace(/&#039;/g, "'");

                const choices = ['True', 'False'];

                const questionId = Date.now().toString();
                req.session.qid = questionId;
                req.session.answer = triviaData.correct_answer;
                req.session.qNumber += 1;

                res.json({
                    type: 'boolean',
                    questionId: questionId,
                    question: triviaData.question,
                    choices: choices,
                    qNumber: req.session.qNumber,
                    score: req.session.score
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ error: 'An error occurred while fetching boolean data.' });
            }
        }
        // Fetch movie data (fill-in-the-blank question)
        else {
            try {
                const { Title, Plot, Released, Director, Actors } = await film();

                const info = `By the director ${Director}, it stars ${Actors} and was released on ${Released}.`;

                const questionId = Date.now().toString();
                req.session.qid = questionId;
                req.session.answer = Title;
                req.session.qNumber += 1;

                res.json({
                    type: 'movie',
                    questionId: questionId,
                    plot: Plot,
                    info: info,
                    qNumber: req.session.qNumber,
                    score: req.session.score
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ error: 'An error occurred while fetching movie.' });
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'An error occurred while fetching trivia data.' });
    }
});

// /answer endpoint with case-insensitivity and punctuation removal
app.post('/answer', async (req, res) => {
    const userAnswer = req.body.ans?.toLowerCase().replace(/[^\w\s]|_/g, '').trim();
    const correctAnswer = req.session.answer?.toLowerCase().replace(/[^\w\s]|_/g, '').trim();

    if (req.session.qid === req.body.questionId && userAnswer === correctAnswer) {
        req.session.score += 1;
        res.json({ success: true, score: req.session.score });
    } else {
        res.json({ success: false, score: req.session.score });
    }
});

app.post('/reset-session', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Could not reset session." });
        }
        res.json({ message: "Session reset successfully." });
    });
});

app.get('/isAuthenticated', async (req, res) => {
    const token = req.cookies.token; // Get token from the HTTP-only cookie

    if (!token) {
        return res.status(401).json({
            isAuthenticated: false, message: 'Not authenticated as there is no token', userName: "", userEmail: "",
            userState: "", userCity: ""
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        // console.log(decoded); // decoded.user.id,name,email
        let user = await User.findOne({ email: decoded.user.email });
        // console.log(user);
        if (user == null) {
            res.cookie('token', '', {
                expires: new Date(0), httpOnly: true
            });
            // console.log("User not found");
            return res.status(401).json({
                isAuthenticated: false, message: 'Invalid token', userName: "", userEmail: "",
                userState: "", userCity: ""
            });
        }
        return res.status(200).json({
            isAuthenticated: true, userName: user.name, userEmail: decoded.user.email,
            userState: decoded.user.state, userCity: decoded.user.city
        });
    } catch (error) {
        return res.status(401).json({
            isAuthenticated: false, message: 'Error verifying token', userName: "", userEmail: "",
            userState: "", userCity: ""
        });
    }
})

// profile cruds
// PUT /api/user
app.put('/api/user', async (req, res) => {
    const { name, email } = req.body;
    const token = req.cookies.token; // Get token from the HTTP-only cookie
    if (!token) {
        return res.status(401).json({
            success: false, message: 'Not authenticated as there is no token'
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.SECRET);
        // console.log(decoded); // decoded.user.id,name,email
        let user = await User.findOne({ email: decoded.user.email });
        // console.log(user);
        if (user == null) {
            res.cookie('token', '', {
                expires: new Date(0), httpOnly: true
            });
            // console.log("User not found");
            return res.status(401).json({
                success: false, error: 'User not found'
            });
        }

        // now update the user
        user.name = name;
        user.email = email;
        await user.save();

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


// PUT /api/user/password
app.put('/api/user/password', async (req, res) => {
    const { password, confirmPassword } = req.body;
    const token = req.cookies.token; // Get token from the HTTP-only cookie
    if (!token) {
        return res.status(401).json({
            success: false, message: 'Not authenticated as there is no token'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        // console.log(decoded); // decoded.user.id,name,email
        let user = await User.findOne({ email: decoded.user.email });
        // console.log(user);
        if (user == null) {
            res.cookie('token', '', {
                expires: new Date(0), httpOnly: true
            });
            // console.log("User not found");
            return res.status(401).json({
                success: false, error: 'User not found'
            });
        }

        try {

            // first compare the current pw

            bcrypt.compare(password, user.password, async function (err, result) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        error: "Internal server error"
                    });
                }
                if (!result) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid credentials"
                    });
                }
                try {
                    // hash the new pw
                    bcrypt.hash(confirmPassword, parseInt(saltRounds), async function (err, hash) {
                        if (err) {
                            return res.status(400).json({
                                success: false,
                                error: "Error hashing the password"
                            });
                        }

                        // update the pw in the db
                        user.password = hash;
                        await user.save();

                        res.status(200).json({
                            success: true,
                            message: "Password changed successfully"
                        });
                    });
                } catch (error) {

                    console.error('Error changing password:', error);
                    res.status(500).json({ success: false, error: 'Internal server error' });

                }



            })

        } catch (error) {
            res.status(500).json({ success: false, error: "Internal server error" });
        }

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
 
// DELETE /api/user
app.delete('/api/user', async (req, res) => {
    const token = req.cookies.token; // Get token from the HTTP-only cookie
    if (!token) {
        return res.status(401).json({
            success: false, message: 'Not authenticated as there is no token'
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        await User.findOneAndDelete({email : decoded.user.email});
        res.json({ success: true, message: 'Account deleted successfully' }); 
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});



app.post('/login', async (req, res) => {
    try {
        // Step 1: Find the user by email
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "User does not exist"
            });
        }

        let pw = req.body.password;
        bcrypt.compare(pw, user.password, async function (err, result) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: "Internal server error"
                });
            }
            if (!result) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid credentials"
                });
            }

            // Step 3: Generate JWT token
            const authData = {
                user: {
                    id: user.id, // Change newUser.id to user.id
                    name: user.name,
                    email: user.email,
                    state: user.state,
                    city: user.city
                }
            }
            const authtoken = jwt.sign(authData, process.env.SECRET, { expiresIn: '24h' });

            // Step 4: Set the token in an HTTP-only cookie
            res.cookie('token', authtoken, {
                httpOnly: true, // Prevent JavaScript from accessing the token
                secure: false, // Set to true if using HTTPS
                sameSite: 'strict', // Helps mitigate CSRF attacks
                maxAge: 3600000 * 24 // 24 hours
            });

            // Step 5: Respond with success message
            res.status(200).json({
                success: true,
                message: "User logged in successfully"
            });
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Something went wrong"
        });
    }
});

app.get('/', (req, res) => {
    res.send('Backend is up and running!');
});
