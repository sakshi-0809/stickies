require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./user');
const JWT = require('jsonwebtoken');
const passportConfig = require('./passportConfig');
const metaphone = require('metaphone');
const nodemailer = require("nodemailer");
const path = require('path');


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/stickies', { useNewUrlParser: true });

mongoose.connection.once('open', () => {
    console.log("connected to mongodb");
}).on('error', (err) => {
    console.log('connection error:', err)
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
app.use(
    session({
        secret: 'secretcode',
        resave: false,
        saveUninitialized: false,
    }));

app.use(cookieParser('secretcode'))
app.use(passport.initialize())
app.use(passport.session())

const signToken = userID => {
    return JWT.sign({
        iss: "Tanishq",
        sub: userID
    }, "secretcode", { expiresIn: "1h" });
}


app.post('/sendmail', async (req, res) => {
    let receiverName = '';
    let receiverEmail = '';
    let starredNotes = [];
    let starredNotesContent = '';

    User.findOne({ _id: req.body._id }, async (err, doc) => {
        if (err)
            res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } });
        else {
            receiverName = doc.name;
            receiverEmail = doc.email;
            starredNotes = doc.notes.filter(note => note.starred !== false);

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "stickies.notesapp@gmail.com",
                    pass: "S@kshiStickies"
                }
            });

            starredNotes.map(starredNote => {
                starredNotesContent = starredNotesContent + `<li>${starredNote.content}</li><br />`;
            })

            const msg = {
                from: '"Stickies" <stickies.notesapp@gmail.com',
                to: receiverEmail,
                subject: "Starred Notes",
                html: `<h2>Hi ${receiverName}!</h2>
                                    <h3>You have the following Starred Notes</h3>
                                    <ul>
                                        ${starredNotesContent}
                                    </ul>
                                        `
            }

            let info = await transporter.sendMail(msg);

            console.log(`Message sent has Id ${info.messageId}`);

            res.status(200).json({ message: { msgBody: 'Mail Sent Successfully!', msgError: false } });
        }
    })
})

app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    if (req.isAuthenticated()) {
        const { name, email, _id, username, notes } = req.user;
        const token = signToken(_id);
        res.cookie('access_token', token, { httpOnly: true, sameSite: true });
        res.status(200).json({ isAuthenticated: true, user: { name, email, _id, username, notes } });
    }
})

app.get('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.clearCookie("access_token");
    res.json({ user: { username: "", email: "" }, success: true });
})

app.post('/register', (req, res) => {
    User.findOne({ username: req.body.username }, async (err, doc) => {
        if (err)
            res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } });
        if (doc)
            res.status(400).json({ message: { msgBody: 'Username is already taken', msgError: true } });
        if (!doc) {
            const hashedPass = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                username: req.body.username,
                password: hashedPass,
                email: req.body.email,
                name: req.body.name,
                notes: []
            });
            await newUser.save(err => {
                if (err) {
                    res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } });
                }
                else {
                    res.status(201).json({ message: { msgBody: 'Account successfully created', msgError: false } });
                }
            });
        }
    })
})

app.get('/authenticated', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { name, email, _id, username, notes } = req.user;
    res.status(200).json({ isAuthenticated: true, user: { name, email, _id, username, notes } });
});

app.post('/addnotes', (req, res) => {
    User.findOne({ _id: req.body._id }, async (err, document) => {
        if (err) {
            console.log(err);
        } else {
            req.body.notes.map(note => {
                note.meta = metaphone(note.content);
            });
            document.notes = req.body.notes;
            await document.save(err => {
                if (err) {
                    res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } });
                }
                else {

                    res.status(201).json({ message: { msgBody: 'Note successfully added', msgError: false } });
                }
            })
        }
    })
})

app.post('/editnote', (req, res) => {
    User.findOne({ _id: req.body._id }, async (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            const noteIndex = doc.notes.findIndex(note => note.key === req.body.note.key);
            doc.notes[noteIndex].content = req.body.note.content;

            await doc.save(err => {
                if (err) {
                    res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } });
                }
                else {

                    res.status(201).json({ message: { msgBody: 'Note successfully edited', msgError: false } });
                }
            })
        }
    })
})

app.post('/deletenote', (req, res) => {
    User.findOne({ _id: req.body._id }, async (err, document) => {
        if (err) {
            console.log(err);
        } else {
            document.notes = document.notes.filter((note) => note.key != req.body.notes._id);

            await document.save(err => {
                if (err) {
                    res.status(500).json({ message: { msgBody: 'Error has occured', msgError: true } });
                }
                else {
                    res.status(201).json({ message: { msgBody: 'Note successfully deleted', msgError: false } });
                }
            })
        }
    })
})

app.post('/search', (req, res) => {
    if (req.body.keyword) {
        const regex = new RegExp(escapeRegex(metaphone(req.body.keyword)), "i");
        const userId = req.body.id;
        User.findOne({ _id: userId }, (err, document) => {
            if (err) {
                console.log(err);
            } else {
                const result = document.notes.filter(note => regex.test(note.meta));
                res.status(200).json({ result });
            }
        })
    }
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

if (process.env.NODE_ENV === 'production') {
    //app.use(express.static('client/build'));

    // app.get('*', (req, res) => {
    //     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    // });

    app.use(express.static(path.join(__dirname, 'client', 'build')));

    app.get('/*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    });
}

app.listen(process.env.PORT || 4000, () => {
    console.log(`Listening at port ${process.env.PORT}`);
});

