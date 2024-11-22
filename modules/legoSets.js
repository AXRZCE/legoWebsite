// legoSets.js
require('dotenv').config();
const Sequelize = require('sequelize');
const pg = require('pg'); // Add this line

// Initialize Sequelize connection with SSL and specify 'dialectModule'
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectModule: pg, // Add this line
    logging: console.log, // Enable logging for SQL queries
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // Allow self-signed certificates
        },
    },
});

// The rest of your code remains unchanged

// Define the Theme model
const Theme = sequelize.define('Theme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    timestamps: false, // Disable createdAt and updatedAt
});

// Define the Set model
const Set = sequelize.define('Set', {
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    year: {
        type: Sequelize.INTEGER,
    },
    num_parts: {
        type: Sequelize.INTEGER,
    },
    theme_id: {
        type: Sequelize.INTEGER,
    },
    img_url: {
        type: Sequelize.STRING,
    },
}, {
    timestamps: false, // Disable createdAt and updatedAt
});

// Create associations between models
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

/**
 * Initialize the database connection and synchronize models.
 */
function initialize() {
    return sequelize.sync()
        .then(() => {
            console.log("Database connection established and models synchronized.");
        })
        .catch(err => {
            console.error("Error initializing database:", err);
            throw new Error("Unable to initialize database");
        });
}

/**
 * Get all sets from the database, optionally filtered by a theme.
 */
function getAllSets(themeFilter) {
    console.log("Fetching all sets with theme filter:", themeFilter);
    const options = { include: [Theme] };

    if (themeFilter) {
        options.where = { '$Theme.name$': themeFilter };
    }

    return Set.findAll(options)
        .then(sets => {
            console.log("Sets fetched successfully.");
            return sets.map(set => ({
                set_num: set.set_num,
                name: set.name,
                year: set.year,
                num_parts: set.num_parts,
                theme: set.Theme ? set.Theme.name : "Unknown",
                img_url: set.img_url,
            }));
        })
        .catch(err => {
            console.error("Error fetching sets:", err);
            throw err;
        });
}

/**
 * Get all themes from the database.
 */
function getAllThemes() {
    console.log("Fetching all themes...");
    return Theme.findAll({ attributes: ['id', 'name'] })
        .then(themes => {
            console.log("Themes fetched successfully.");
            return themes;
        })
        .catch(err => {
            console.error("Error fetching themes:", err);
            throw err;
        });
}

/**
 * Get a set by its set number.
 */
function getSetByNum(setNum) {
    console.log("Fetching set by number:", setNum);
    return Set.findOne({ where: { set_num: setNum }, include: [Theme] })
        .then(set => {
            if (!set) {
                throw new Error("Set not found");
            }
            console.log("Set fetched successfully:", set);
            return {
                set_num: set.set_num,
                name: set.name,
                year: set.year,
                num_parts: set.num_parts,
                theme: set.Theme ? set.Theme.name : "Unknown",
                img_url: set.img_url,
            };
        })
        .catch(err => {
            console.error("Error fetching set:", err);
            throw err;
        });
}

/**
 * Add a new set to the database.
 */
function addSet(setData) {
    console.log("Adding new set:", setData);
    return Set.create(setData)
        .then(() => {
            console.log("Set added successfully.");
        })
        .catch(err => {
            console.error("Error adding set:", err);
            throw err;
        });
}

/**
 * Edit an existing set in the database.
 */
function editSet(set_num, setData) {
    console.log("Editing set:", set_num);
    return Set.update(setData, { where: { set_num } })
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) throw new Error("No set found to update.");
            console.log("Set updated successfully.");
        })
        .catch(err => {
            console.error("Error updating set:", err);
            throw err;
        });
}

/**
 * Delete a set from the database.
 */
function deleteSet(set_num) {
    console.log("Deleting set:", set_num);
    return Set.destroy({ where: { set_num } })
        .then(rowsDeleted => {
            if (rowsDeleted === 0) throw new Error("No set found to delete");
            console.log("Set deleted successfully.");
        })
        .catch(err => {
            console.error("Error deleting set:", err);
            throw err;
        });
}

function getFeaturedSets() {
    console.log("Fetching featured sets...");
    return Set.findAll({
        limit: 6,
        include: [Theme],
    }).then(sets => sets.map(set => ({
        set_num: set.set_num,
        name: set.name,
        year: set.year,
        num_parts: set.num_parts,
        theme: set.Theme ? set.Theme.name : "Unknown",
        img_url: set.img_url,
    })));
}

module.exports = {
    initialize,
    getAllSets,
    getAllThemes,
    getSetByNum,
    addSet,
    editSet,
    deleteSet,
    getFeaturedSets,
};
