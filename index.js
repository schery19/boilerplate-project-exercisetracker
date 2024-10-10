require('dotenv').config()

const cors = require('cors')
const express = require('express')

const app = express()



const { MongoClient } = require('mongodb');


let mongoose = require('mongoose');

let mongoClient = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });


const exerciseSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
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

    console.log("User registered : "+ newUser);

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

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let query = { user_id: req.params._id };


  let dateFilter = {};

  if (req.query.from) {
    const fromDate = new Date(req.query.from);
    if (fromDate.toString() !== 'Invalid Date') {
      dateFilter.$gte = fromDate.toISOString().split('T')[0];
    }
  }

  if (req.query.to) {
    const toDate = new Date(req.query.to);
    if (toDate.toString() !== 'Invalid Date') {
      dateFilter.$lte = toDate.toISOString().split('T')[0];
    }
  }


  if (Object.keys(dateFilter).length > 0) {
    query.date = dateFilter;
  }


  const limit = parseInt(req.query.limit) || 50;


  const exos = await Exercise.find(query).limit(limit);


  const logs = exos.map(exo => ({
    description: exo.description,
    duration: exo.duration,
    date: new Date(exo.date).toDateString()
  }));

  console.log(req.query);
  console.log(query);


  res.json({
    username: user.username,
    count: logs.length,
    _id: user._id,
    log: logs
  });

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
  
    let date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();

    // if (req.body.date === '') {
    //   date = new Date(); 
    // } else {
    //   date = new Date(req.body.date).toDateString(); 
    // }
  
    const newExo = {
      user_id: user._id,
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
