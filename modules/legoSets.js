require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

// Set up Sequelize to point to your PostgreSQL database
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  }
});

// Theme model
const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

// Set model
const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Initialize database
function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      resolve();
    } catch (err) {
      reject(err.message);
    }
  });
}

// Get all sets
function getAllSets() {
  return new Promise(async (resolve, reject) => {
    try {
      let sets = await Set.findAll({ include: [Theme] });
      resolve(sets);
    } catch (err) {
      reject(err.message);
    }
  });
}

// Get all themes
function getAllThemes() {
  return new Promise(async (resolve, reject) => {
    try {
      let themes = await Theme.findAll();
      resolve(themes);
    } catch (err) {
      reject(err.message);
    }
  });
}

// Get a specific set by its number
function getSetByNum(setNum) {
  return new Promise(async (resolve, reject) => {
    try {
      let foundSet = await Set.findOne({
        where: { set_num: setNum },
        include: [Theme],
      });
      if (foundSet) {
        resolve(foundSet);
      } else {
        reject("Unable to find requested set");
      }
    } catch (err) {
      reject(err.message);
    }
  });
}

// Get sets filtered by a specific theme
function getSetsByTheme(theme) {
  return new Promise(async (resolve, reject) => {
    try {
      let foundSets = await Set.findAll({
        where: { '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` } },
        include: [Theme],
      });
      if (foundSets.length > 0) {
        resolve(foundSets);
      } else {
        reject("Unable to find requested sets");
      }
    } catch (err) {
      reject(err.message);
    }
  });
}

// Add a new set
function addSet(setData) {
  return new Promise(async (resolve, reject) => {
    try {
      await Set.create(setData);
      resolve();
    } catch (err) {
      reject(err.errors[0].message);
    }
  });
}

// Edit an existing set
function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    try {
      await Set.update(setData, { where: { set_num: set_num } });
      resolve();
    } catch (err) {
      reject(err.errors[0].message);
    }
  });
}

// Delete a set
function deleteSet(set_num) {
  return new Promise(async (resolve, reject) => {
    try {
      await Set.destroy({ where: { set_num: set_num } });
      resolve();
    } catch (err) {
      reject(err.errors[0].message);
    }
  });
}

// Get featured sets (limit the number of results)
function getFeaturedSets(limit = 6) {
  return new Promise(async (resolve, reject) => {
    try {
      let featuredSets = await Set.findAll({
        include: [Theme],
        limit: limit,
        order: [['year', 'DESC']],
      });
      resolve(featuredSets);
    } catch (err) {
      reject(`Error fetching featured sets: ${err.message}`);
    }
  });
}

module.exports = {
  initialize,
  getAllSets,
  getAllThemes,
  getSetByNum,
  getSetsByTheme,
  addSet,
  editSet,
  deleteSet,
  getFeaturedSets,
};
