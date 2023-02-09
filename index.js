const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
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
    date:Date
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
        return res.json({
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            _id: user._id,
            date: new Date(exercise.date).toDateString()

          });
    }
});
app.get("/api/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.get("/api/users/:_id/logs2", async (req, res) => {
    const { _id } = req.params;
    const { from, to, limit } = req.query;
    const user = await User.findById(_id);
    const exercises = await Exercise.find({ username: user.username });
    if (!user) {
        res.json({ error: "User not found" });
    } else {        
        // let result = exercises;
        if (from) {
          from = new Date(from)
        } else {
          from = new Date(0)
        }
        if (to) {
          to = new Date(to)
        } else {
          to = new Date() //make the date equal to now, so get query till current date
        }
        if (limit === undefined) {
          limit = 0
        }

        const result = await   Exercise.find({ username: user.username })
      .where('date').gte(from).lte(to)
      .limit(parseInt(limit))
      result = result.map(exercise_=>{
         return{
          description: exercise_.description,
          duration: exercise_.duration,
          date: new Date(exercise_.date).toDateString(),
         }
        
      })
        //   return {
        //     description: String(user_.description),
        //     duration: Number(user_.duration),
        //     date:  new Date().toDateString()
        //     };
        // });

        res.json({
            username: user.username,            
            count: exercises.length,
            _id: user._id,
            log: result,
        });
    }
});


app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = await User.findById(_id);
  const exercises = await Exercise.find({ username: user.username });
  if (!user) {
      res.json({ error: "User not found" });
  } else {        
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
      result=result.map((user_) => {          
        return {
          description: String(user_.description),
          duration: Number(user_.duration),
          date:  user_.date.toDateString()
          };
      });

      res.json({
          username: user.username,            
          count: exercises.length,
          _id: user._id,
          log: result,
      });
  }
});

app.post("/api/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = await User.findById(_id);
  const exercises = await Exercise.find({ username: user.username });
  if (!user) {
      res.json({ error: "User not found" });
  } else {        
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
      result=result.map((user_) => {          
        return {
          description: String(user_.description),
          duration: Number(user_.duration),
          date:  user_.date.toDateString()
          };
      });

      res.json({
          username: user.username,            
          count: exercises.length,
          _id: user._id,
          log: result,
      });
  }
});

app.post("/api/fileanalyse", upload.single("upfile"), async (req, res) => {
    const { originalname, mimetype, size } = req.file;
    res.json({
        name: originalname,
        type: mimetype,
        size: size,
    });

  
});



const listener = app.listen(process.env.PORT || 3000, async () => {
    mongoose.set("strictQuery", false);
    await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log("Your app is listening on port " + listener.address().port);
});
