require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Theme, Set } = require('./modules/legoSets'); // Import models

// MongoDB connection
mongoose
  .connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Import JSON files
const themes = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'themeData.json'), 'utf-8'));
const sets = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'setData.json'), 'utf-8'));

// Function to insert data
async function importData() {
  try {
    // Clear existing collections
    await Theme.deleteMany();
    await Set.deleteMany();

    // Insert themes
    const themeDocs = await Theme.insertMany(
      themes.map((theme) => ({
        _id: theme.id, // Use the 'id' from the JSON file as the _id
        name: theme.name,
      }))
    );

    console.log('Themes imported:', themeDocs.length);

    // Insert sets
    const setDocs = await Set.insertMany(
      sets.map((set) => ({
        set_num: set.set_num,
        name: set.name,
        year: set.year,
        num_parts: set.num_parts,
        theme_id: set.theme_id,
        img_url: set.img_url,
      }))
    );

    console.log('Sets imported:', setDocs.length);
    process.exit(0); // Exit after successful import
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1); // Exit with failure
  }
}

// Run the import
importData();
