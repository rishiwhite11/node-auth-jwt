var express = require('express');
const _ = require("lodash");

const User = require("../models/user");

var router = express.Router();

/* GET users listing. */
router.post("/users", (req, res) => {
  var body = _.pick(req.body, ['username', 'password']);
  var newUser = new User(body);
  newUser.save().then(() => {
    //res.status(200).send(newUser);
    return newUser.generateAuthToken()
  }).then((token) => {
    if(token){
      res.header('x-auth',token).send(newUser);
    }
  }).catch((e) => res.status(400).send(e));
})

router.get("/users/me", (req, res) => {
  var token = req.headers['x-auth'];
  User.findByToken(token).then((user) => {
    if(!user){
      return res.status(404).send();
    }
    res.status(200).send(user);
  }).catch((e) => res.status(400).send())
})

router.post("/users/login", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  User.findByCredentials(username, password).then((user) => {
    if(!user){
      return res.status(404).send("not found");
    }
    res.status(200).send({msg:"Login success"});
  }).catch((e) => res.status(400).send());
})

module.exports = router;
