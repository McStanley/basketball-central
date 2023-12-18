#! /usr/bin/env node

console.log('This script will populate your database with sample data.');
console.log(
  'Pass the connection string as argument - e.g.: node populateDatabase "mongodb+srv://username:password@host/basketball_central?retryWrites=true&w=majority"',
);

const userArgs = process.argv.slice(2);

const Team = require('../models/Team');
const Player = require('../models/Player');

const teams = [];

const mongoose = require('mongoose');

const databaseURI = userArgs[0];

(async () => {
  try {
    console.log('About to connect...');
    await mongoose.connect(databaseURI);
    console.log('Connected to MongoDB');
    await createTeams();
    await createPlayers();
    console.log('Closing mongoose...');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();

async function createTeams() {
  console.log('Creating teams:');
  await Promise.all([
    createTeam(0, 'Gale Guardians', 'Wind Canyon', 2012),
    createTeam(1, 'Sand Settlers', 'Desert Oasis', 2008),
    createTeam(2, 'Magma Mavericks', 'Volcano Ridge', 2016),
    createTeam(3, 'Terra Titans', 'Mountain Peak', 2010),
  ]);
}

async function createPlayers() {
  console.log('Creating players:');
  await Promise.all([
    createPlayer(
      'Marcus',
      'Johnson',
      teams[0],
      '12',
      'PG',
      185,
      75,
      'US',
      new Date('1995-03-15T00:00:00Z'),
    ),
    createPlayer(
      'Alex',
      'Mitchell',
      teams[0],
      '24',
      'SG',
      190,
      80,
      'CA',
      new Date('1990-07-20T00:00:00Z'),
    ),
    createPlayer(
      'Cameron',
      'Hernandez',
      teams[0],
      '46',
      'SF',
      200,
      90,
      'ES',
      new Date('1988-12-10T00:00:00Z'),
    ),
    createPlayer(
      'Stanisław',
      'Olejniczak',
      teams[0],
      '16',
      'PF',
      197,
      85,
      'PL',
      new Date('2000-03-31T00:00:00Z'),
    ),
    createPlayer(
      'Hugo',
      'Martin',
      teams[0],
      '5',
      'C',
      210,
      100,
      'FR',
      new Date('1993-09-05T00:00:00Z'),
    ),
    createPlayer(
      'Jordan',
      'Smith',
      teams[1],
      '10',
      'PG',
      182,
      73,
      'US',
      new Date('1994-02-22T00:00:00Z'),
    ),
    createPlayer(
      'Ethan',
      'Williams',
      teams[1],
      '22',
      'SG',
      188,
      78,
      'CA',
      new Date('1989-06-18T00:00:00Z'),
    ),
    createPlayer(
      'Liam',
      'Gomez',
      teams[1],
      '2',
      'SF',
      196,
      88,
      'ES',
      new Date('1991-10-03T00:00:00Z'),
    ),
    createPlayer(
      'Mason',
      'Anderson',
      teams[1],
      '6',
      'PF',
      197,
      84,
      'AU',
      new Date('1993-04-15T00:00:00Z'),
    ),
    createPlayer(
      'Oscar',
      'Dupont',
      teams[1],
      '0',
      'C',
      208,
      102,
      'FR',
      new Date('1990-12-08T00:00:00Z'),
    ),
    createPlayer(
      'Kai',
      'Tanaka',
      teams[2],
      '5',
      'PG',
      180,
      70,
      'JP',
      new Date('1994-02-22T00:00:00Z'),
    ),
    createPlayer(
      'Mateo',
      'Rodriguez',
      teams[2],
      '24',
      'SG',
      185,
      75,
      'AR',
      new Date('1989-06-18T00:00:00Z'),
    ),
    createPlayer(
      'Yara',
      'Ahmed',
      teams[2],
      '18',
      'SF',
      195,
      80,
      'EG',
      new Date('1991-10-03T00:00:00Z'),
    ),
    createPlayer(
      'Emmanuel',
      'Okafor',
      teams[2],
      '42',
      'PF',
      200,
      90,
      'NG',
      new Date('1993-04-15T00:00:00Z'),
    ),
    createPlayer(
      'Javier',
      'Martinez',
      teams[2],
      '50',
      'C',
      210,
      100,
      'MX',
      new Date('1990-12-08T00:00:00Z'),
    ),
    createPlayer(
      'Claude',
      'Speed',
      teams[3],
      '1',
      'PG',
      185,
      75,
      'US',
      new Date('2001-10-22T00:00:00Z'),
    ),
    createPlayer(
      'Tommy',
      'Vercetti',
      teams[3],
      '2',
      'SG',
      178,
      76,
      'US',
      new Date('2002-10-29T00:00:00Z'),
    ),
    createPlayer(
      'Niko',
      'Bellic',
      teams[3],
      '8',
      'SF',
      190,
      80,
      'RS',
      new Date('2008-04-29T00:00:00Z'),
    ),
    createPlayer(
      'Trevor',
      'Phillips',
      teams[3],
      '69',
      'PF',
      192,
      93,
      'CA',
      new Date('2013-09-17T00:00:00Z'),
    ),
    createPlayer(
      'Carl',
      'Johnson',
      teams[3],
      '4',
      'C',
      195,
      100,
      'US',
      new Date('2004-10-26T00:00:00Z'),
    ),
  ]);
}

async function createTeam(index, name, location, establishedYear) {
  const team = new Team({
    name,
    location,
    established_year: establishedYear,
  });

  await team.save();
  teams[index] = team;
  console.log(`Created team: ${name}`);
}

async function createPlayer(
  firstName,
  lastName,
  team,
  number,
  position,
  height,
  weight,
  country,
  dateOfBirth,
) {
  const player = new Player({
    first_name: firstName,
    last_name: lastName,
    team,
    number,
    position,
    height,
    weight,
    country,
    date_of_birth: dateOfBirth,
  });

  await player.save();
  console.log(`Created player: ${firstName} ${lastName}`);
}
