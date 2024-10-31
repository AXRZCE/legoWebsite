const fs = require('fs');
const path = require('path');

let sets = [];
let themes = [];

// Function to initialize the data by loading from JSON files
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '../data/setData.json'), 'utf8', (err, setData) => {
            if (err) {
                return reject("Unable to load set data file");
            }
            fs.readFile(path.join(__dirname, '../data/themeData.json'), 'utf8', (err, themeData) => {
                if (err) {
                    return reject("Unable to load theme data file");
                }
                
                sets = JSON.parse(setData);
                themes = JSON.parse(themeData);

                // Map theme names to sets
                sets.forEach(set => {
                    // Convert theme_id and id to strings to ensure proper matching
                    const theme = themes.find(t => t.id.toString() === set.theme_id.toString());
                    set.theme = theme ? theme.name : "Unknown";
                });
                
                resolve();
            });
        });
    });
}

// Function to get all sets, optionally filtered by a theme
function getAllSets(themeFilter) {
    if (themeFilter) {
        return sets.filter(set => set.theme === themeFilter);
    }
    return sets;
}

// Function to get all themes
function getAllThemes() {
    return themes;
}

// Function to get a set by its set number
function getSetByNum(setNum) {
    return sets.find(set => set.set_num === setNum);
}

// Function to get featured sets (modify as needed for featured criteria)
function getFeaturedSets() {
    return sets.slice(0, 6); // Example: returning the first 6 sets as "featured"
}

module.exports = { initialize, getAllSets, getAllThemes, getSetByNum, getFeaturedSets };
