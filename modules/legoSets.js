require('dotenv').config();
const mongoose = require('mongoose');

// Define Theme Schema
// Theme Schema
const themeSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Matches `theme_id` in `sets`
  name: { type: String, required: true },
});

// Set Schema
const setSchema = new mongoose.Schema({
  set_num: { type: String, required: true, unique: true },
  name: String,
  year: Number,
  num_parts: Number,
  theme_id: { type: String, ref: 'Theme' }, // Same type as `_id` in themes
  img_url: String,
});


const Theme = mongoose.model('Theme', themeSchema);
const Set = mongoose.model('Set', setSchema);

/**
 * Initialize MongoDB connection
 */
function initialize() {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log('Connected to MongoDB Atlas!');
        resolve();
      })
      .catch((err) => reject(`Unable to connect to MongoDB: ${err.message}`));
  });
}

/**
 * Get all sets with their themes populated
 */
function getAllSets() {
  return new Promise(async (resolve, reject) => {
    try {
      const sets = await Set.find().populate('theme_id');
      resolve(sets);
    } catch (err) {
      reject(err.message);
    }
  });
}

/**
 * Get all themes
 */
function getAllThemes() {
  return new Promise(async (resolve, reject) => {
    try {
      const themes = await Theme.find();
      resolve(themes);
    } catch (err) {
      reject(err.message);
    }
  });
}

/**
 * Get a specific set by its number
 */
function getSetByNum(setNum) {
  return new Promise(async (resolve, reject) => {
    try {
      const foundSet = await Set.findOne({ set_num: setNum }).populate('theme_id');
      if (foundSet) {
        resolve(foundSet);
      } else {
        reject('Unable to find requested set');
      }
    } catch (err) {
      reject(err.message);
    }
  });
}

/**
 * Get sets filtered by a theme name (case-insensitive)
 */
function getSetsByTheme(theme) {
  return new Promise(async (resolve, reject) => {
    try {
      const themeDoc = await Theme.findOne({ name: { $regex: theme, $options: 'i' } });
      if (!themeDoc) {
        return reject('Unable to find requested sets');
      }

      const foundSets = await Set.find({ theme_id: themeDoc._id }).populate('theme_id');
      resolve(foundSets);
    } catch (err) {
      reject(err.message);
    }
  });
}

/**
 * Add a new set
 */
function addSet(setData) {
  return new Promise(async (resolve, reject) => {
    try {
      const theme = await Theme.findById(setData.theme_id);
      if (!theme) {
        return reject('Invalid theme_id provided');
      }

      const newSet = new Set(setData);
      await newSet.save();
      resolve();
    } catch (err) {
      reject(err.message || 'Unable to add set');
    }
  });
}

/**
 * Edit an existing set
 */
function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Set.updateOne({ set_num }, setData);
      if (result.matchedCount === 0) {
        reject('No changes made or set not found');
      } else {
        resolve();
      }
    } catch (err) {
      reject(err.message || 'Unable to update set');
    }
  });
}

/**
 * Delete a set
 */
function deleteSet(set_num) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Set.deleteOne({ set_num });
      if (result.deletedCount === 0) {
        reject('No set deleted, set not found');
      } else {
        resolve();
      }
    } catch (err) {
      reject(err.message || 'Unable to delete set');
    }
  });
}

/**
 * Get featured sets, limited in number and sorted by year descending
 */
function getFeaturedSets(limit = 6) {
  return new Promise(async (resolve, reject) => {
    try {
      const featuredSets = await Set.find()
        .populate('theme_id')
        .limit(limit)
        .sort({ year: -1 });
      resolve(featuredSets);
    } catch (err) {
      reject(`Error fetching featured sets: ${err.message}`);
    }
  });
}

module.exports = {
  Theme,
  Set,
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
