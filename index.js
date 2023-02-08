const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {  
  res.sendFile(__dirname + '/views/index.html')
});
const users = [];
const exercises = []

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  users.map((user) => {
    if (user.username === username) {
      return res.json({ error: "Username already taken" });
    }
  });
  users.push({ username: username, _id: users.length });
  res.json({ username: username, _id: users.length - 1 });

});
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users[Number(_id)];
  if (!user) {
    res.json({ error: "User not found" });
  }
  else {
    const exercise = {
      _id,      
      description: description,
      duration: Number(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString()
    };
    exercises.push(exercise);
    return res.json(
    exercises.map((exercise) => {
      if (exercise._id === _id) {
        return res.json({
          username: user.username,
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date,
          _id: exercise._id
        })
      }}));
      
    res.json(
    {
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,      
      date: exercise.date,
      _id: exercise._id

    }
    );
    // const check = exercises.filter(user => user._id == _id).map(exercise_ => {
    //   if(!!exercise_)
    //   return Object.assign({username:users[_id].username}, exercise_)
    // })
    // console.log(check);
    // console.log(exercise); 
    // res.json( Object.assign({username:users[_id].username}, exercise));
  }
});
app.get('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const user = users[Number(_id)];
  if (!user) {
    res.json({ error: "User not found" });
  }
  else {
    
    const check = exercises.filter(user_ => user_._id == _id).map(exercise_ => {
      if(!!exercise_)
      return Object.assign({username:users[_id].username}, exercise_)
    })
    res.json(check);
  }
});
app.get('/api/users', (req, res) => {
  res.json(
users
    // users.map(user => {
    //   return { username: user.username, _id: user._id }
    // })
  );
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users[Number(_id)];
  if (!user) {
    res.json({ error: "User not found" });
  }
  else {
    let result = exercises.filter(user => user._id == _id);
    if (from) {
      result = result.filter(user => new Date(user.date) > new Date(from));
    }
    if (to) {
      result = result.filter(user => new Date(user.date) < new Date(to));
    }
    if (limit) {
      result = result.slice(0, limit);
    }
    res.json({ username: user.username, _id: user._id, count: exercises.length, log: result });
  }
  // res.json({ username: user.username, _id: user._id, count: exercises.length, log: exercises.filter(user => user._id == _id) });
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
