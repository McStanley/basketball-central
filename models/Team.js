const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const TeamSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  established_year: { type: Number, required: true },
  logo: { type: String },
});

TeamSchema.virtual('url').get(function getUrl() {
  return `/teams/${this._id}`;
});

module.exports = model('Team', TeamSchema);
