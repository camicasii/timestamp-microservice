const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

let userSchema = new mongoose.Schema({
    username: String,
});
let User = mongoose.model("User", userSchema);
let exerciseSchema = new mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: Date,
});
let Exercise = mongoose.model("Exercise", exerciseSchema);

app.post("/api/users", async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username: username });
    if (user) {
        return res.json({ error: "Username already taken" });
    }
    const newUser = new User({ username: username });
    await newUser.save();
    res.json({ username: username, _id: newUser._id });
});
app.post("/api/users/:_id/exercises", async (req, res) => {
    const { _id } = req.params;
    const { description, duration, date } = req.body;
    const user = await User.findById(_id);
    if (!user) {
        res.json({ error: "User not found" });
    } else {
        const exercise = new Exercise({
            username: user.username,
            description: description,
            duration: Number(duration),
            date: date
                ? new Date(date).toDateString()
                : new Date().toDateString(),
        });
        await exercise.save();
        return res.json(exercise);
    }
});
app.get("/api/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.get("/api/users/:_id/logs", async (req, res) => {
    const { _id } = req.params;
    const { from, to, limit } = req.query;
    const user = await User.findById(_id);
    const exercises = await Exercise.find({ username: user.username });
    if (!user) {
        res.json({ error: "User not found" });
    } else {
        console.log(exercises);
        let result = exercises;
        if (from) {
            result = result.filter(
                (user_) => new Date(user_.date) > new Date(from)
            );
        }
        if (to) {
            result = result.filter(
                (user_) => new Date(user_.date) < new Date(to)
            );
        }
        if (limit) {
            result = result.slice(0, limit);
        }
        result=result.map((user_) => {user_.date = new Date(user_.date).toDateString()});

        res.json({
            username: user.username,
            _id: user._id,
            count: exercises.length,
            log: result,
        });
    }
});

const listener = app.listen(process.env.PORT || 3000, async () => {
    mongoose.set("strictQuery", false);
    await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log("Your app is listening on port " + listener.address().port);
});
