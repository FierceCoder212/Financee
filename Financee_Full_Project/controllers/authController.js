const User = require("../models/User");
const Calculation = require("../models/Calculation");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 1 * 24 * 60 * 60;
secret='data sheet project';
const createToken = (id) => {
  return jwt.sign({ id }, secret, {
    expiresIn: maxAge
  });
}

// controller actions
module.exports.home_get =  async (req, res) => { 
    
  //    res.redirect('/homes', {dbs:'123'})
  res.render('home')   
}

module.exports.dbdata_get = async (req, res)=>{
  const {id} = req.params;
  //console.log(id);
  
  Calculation.find({"useri": {$eq: id}}, function (err, data) {
    if (!err) {
        res.json(data);
    } else {
        throw err;
    }
}).clone().catch(function(err){ console.log(err)})
/*query = {"useri": {$eq: id}}
 const data= await Calculation.find(query);
 console.log(data);
 res.json(data);*/
}

module.exports.home_post = async (req, res) => {
  const {incomea, expensea, transfera, useri, dt } = req.body;
  try {
    const calculation = await Calculation.create({ incomea, expensea, transfera ,useri , dt });
    res.status(201).json({ calculation: calculation._id });
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
 
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}