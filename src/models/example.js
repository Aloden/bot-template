const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  example: Boolean,
  userId: String
})

module.exports = mongoose.model('example', Schema)