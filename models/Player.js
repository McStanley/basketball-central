const mongoose = require('mongoose');
const luxon = require('luxon');

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

PlayerSchema.virtual('position_name').get(function getPositionName() {
  const positions = {
    PG: 'Point Guard',
    SG: 'Shooting Guard',
    SF: 'Small Forward',
    PF: 'Power Forward',
    C: 'Center',
  };

  return positions[this.position];
});

PlayerSchema.virtual('age').get(function getAge() {
  const birth = luxon.DateTime.fromJSDate(this.date_of_birth);
  const today = luxon.DateTime.utc().startOf('day');

  const age = today.diff(birth, 'years').years;

  return Math.floor(age);
});

PlayerSchema.virtual('url').get(function getUrl() {
  return `/players/${this._id}`;
});

module.exports = model('Player', PlayerSchema);
