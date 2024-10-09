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


app.post('/api/users/:_id/exercises', (req, res) => {
  console.log(req.body);

  var user;

  User.find

  if(req.body.date = '')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
