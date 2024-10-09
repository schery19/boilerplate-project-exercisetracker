require('dotenv').config()

const cors = require('cors')
const express = require('express')

const app = express()



const { MongoClient } = require('mongodb');


let mongoose = require('mongoose');

let mongoClient = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });


const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  description: { type: String },
  duration: Number,
  date: { type: String, required: true }
});


const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
});


// const logSchema = new mongoose.Schema({
//   ...userSchema,
//   description: { type: String, required: true },
//   duration: { type: Number, required: true },
//   date: { type: String, required: true }
// });


let User = mongoose.model("User", userSchema);

let Exercise = mongoose.model("Exercise", exerciseSchema);

// let Log = mongoose.model("Log", LogSchema);


const saveUser = (userData, done) => {

  let userToSave = new User(userData);


  userToSave.save((err, dataSaved) => {
    if(err) return console.log(err);
    done(null, dataSaved);
  });

};


const saveExo = (exoData, done) => {

  let exoToSave = new Exercise(exoData);

  exoToSave.save((err, dataSaved) => {
    if(err) return console.log(err);
    done(null, dataSaved);
  });

};



findExos = () => {
  Exercise.find({}, (err, exos) => {
    if(err) return console.error(err);

    return exos;
  });
};




app.use(express.urlencoded())
app.use(cors())
app.use(express.static('public'))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', (req, res) => {
  // console.log(req.body);

  saveUser({username: req.body.username}, (err, newUser) => {
    if(err) console.error(err);

    res.json(newUser);
  });


});


app.get('/api/users', (req, res) => {
  User.find({}, (err, users) => {
    if(err) console.error(err);

    res.json(users)
  });

});


app.get('/api/users/:_id/logs', async (req, res) => {
  const user = await User.findById(req.params._id);

  // console.log(user)

  if(!user)
    return res.status(404).json({ error: 'User not found' }); 

  const exos = await Exercise.find({username: user.username});


  const logs = exos.map(log => ({
    description: log.description,
    duration: log.duration,
    date: new Date(log.date).toDateString()  // Format the date as a string
  }));
  

  res.json({
    username: user.username,
    count: exos.length,
    _id: user._id,
    log: logs
  });

  console.log(exos);

});


app.post('/api/users/:_id/exercises', (req, res) => {
  console.log(req.body);


  User.findById(req.params._id, (err, user) => {
    if (err) {
      console.error('Error retrieving users:', err);
      return res.status(500).json({ error: 'Error retrieving user with id ' });
    }
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' }); 
    }
  
    let date;

    if (req.body.date === '') {
      date = new Date().toDateString(); 
    } else {
      date = new Date(req.body.date).toDateString(); 
    }
  
    const newExo = {
      username: user.username,
      description: req.body.description,
      duration: req.body.duration,
      date: date
    };
  
    
    saveExo(newExo, (err, dataSaved) => {
      if (err) {
        console.error('Error saving exercise:', err);
        return res.status(500).json({ error: 'Error saving exercise' });
      }

      let userArray = {
        "_id": user._id,
        "username": user.username,
        "description": dataSaved.description,
        "duration": dataSaved.duration,
        "date": dataSaved.date
      };

  
      res.json(userArray);
    });

  });

  
});








const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
