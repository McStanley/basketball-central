const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const PlayerSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  number: { type: String, required: true },
  position: {
    type: String,
    enum: ['PG', 'SG', 'SF', 'PF', 'C'],
    required: true,
  },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  country: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
});

PlayerSchema.virtual('full_name').get(function getFullName() {
  return `${this.first_name} ${this.last_name}`;
});

PlayerSchema.virtual('url').get(function getUrl() {
  return `/players/${this._id}`;
});

module.exports = model('Player', PlayerSchema);
