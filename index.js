const express = require('express')
const app = express()
const cors = require('cors')
const  mongoose = require('mongoose');
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {  
  res.sendFile(__dirname + '/views/index.html')
});
// const users = [];
// const exercises = []

let userSchema = new mongoose.Schema({
  username: String
});
let User = mongoose.model("User", userSchema);
let exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
});
let Exercise = mongoose.model("Exercise", exerciseSchema);


app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  const user =await User.findOne({username:username});  
  if (user) {
    return res.json({ error: "Username already taken" });
  }
  const newUser = new User({username:username});
  await newUser.save();
  res.json({ username: username, _id: newUser._id });
});
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user =User.findById(_id);
  if (!user) {
    res.json({ error: "User not found" });
  }
  else {
    const exercise = new Exercise({   
      username: user.username,       
      description: description,
      duration: Number(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString()
    });
    exercise.save();
    return res.json(exercise);
  }
      

    
    // const check = exercises.filter(user_ => user_._id == _id).map(exercise_ => {
    //   if(!!exercise_)
    //   return Object.assign({username:users[_id].username}, exercise_)
    // })
    // check.concat(Object.assign({username:users[_id].username}, exercise));
    // return res.json(
    //   check
    // );
      
    // res.json(
    // {
    //   username: user.username,
    //   description: exercise.description,
    //   duration: exercise.duration,      
    //   date: exercise.date,
    //   _id: exercise._id

    // }
    // );
    // const check = exercises.filter(user => user._id == _id).map(exercise_ => {
    //   if(!!exercise_)
    //   return Object.assign({username:users[_id].username}, exercise_)
    // })
    // console.log(check);
    // console.log(exercise); 
    // res.json( Object.assign({username:users[_id].username}, exercise));
  // }
});
app.get('/api/users',async (req, res) => {
  const users =await User.find();
  res.json(
users
      );
});

app.get('/api/users/:_id/logs',async  (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user =await User.findById(_id);
  const exercises =await Exercise.find({username:user.username});
  if (!user) {
    res.json({ error: "User not found" });
  }
  else {
    console.log(exercises);
    let result = exercises;
    if (from) {
      result = result.filter(user_ => new Date(user_.date) > new Date(from));
    }
    if (to) {
      result = result.filter(user_ => new Date(user_.date) < new Date(to));
    }
    if (limit) {
      result = result.slice(0, limit);
    }
    res.json({ username: user.username, _id: user._id, count: exercises.length, log: result });
  }
  // res.json({ username: user.username, _id: user._id, count: exercises.length, log: exercises.filter(user => user._id == _id) });
})





const listener = app.listen(process.env.PORT || 3000, async() => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(`${process.env.MONGO_URI}`);
  console.log('Your app is listening on port ' + listener.address().port)
})
