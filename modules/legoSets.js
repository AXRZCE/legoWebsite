require('dotenv').config();
const Sequelize = require('sequelize');

// Initialize Sequelize connection with SSL
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Disable SQL query logging for cleaner output
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // Allow self-signed certificates
        },
    },
});

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
 * @param {string} themeFilter - Optional theme name to filter sets by.
 */
function getAllSets(themeFilter) {
    const options = {
        include: [Theme],
    };

    if (themeFilter) {
        options.where = {
            '$Theme.name$': themeFilter,
        };
    }

    return Set.findAll(options)
        .then(sets => sets.map(set => ({
            set_num: set.set_num,
            name: set.name,
            year: set.year,
            num_parts: set.num_parts,
            theme: set.Theme ? set.Theme.name : "Unknown",
            img_url: set.img_url,
        })));
}

/**
 * Get all themes from the database.
 */
function getAllThemes() {
    return Theme.findAll({
        attributes: ['id', 'name'],
    });
}

/**
 * Get a set by its set number.
 * @param {string} setNum - The set number to search for.
 */
function getSetByNum(setNum) {
    return Set.findOne({
        where: { set_num: setNum },
        include: [Theme],
    }).then(set => {
        if (!set) throw new Error("Unable to find requested set");
        return {
            set_num: set.set_num,
            name: set.name,
            year: set.year,
            num_parts: set.num_parts,
            theme: set.Theme ? set.Theme.name : "Unknown",
            img_url: set.img_url,
        };
    });
}

/**
 * Get featured sets (e.g., first 6 sets).
 */
function getFeaturedSets() {
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

/**
 * Add a new set to the database.
 * @param {Object} setData - The data of the set to add.
 */
function addSet(setData) {
    return Set.create(setData)
        .then(() => {
            console.log(`Set with set_num ${setData.set_num} added successfully.`);
        })
        .catch(err => {
            if (err.name === 'SequelizeUniqueConstraintError') {
                throw new Error(`A set with the set number '${setData.set_num}' already exists.`);
            } else {
                throw new Error(`Unable to add set: ${err.message}`);
            }
        });
}

/**
 * Edit an existing set in the database.
 * @param {string} set_num - The set number of the set to update.
 * @param {object} setData - The updated set data.
 */
function editSet(set_num, setData) {
    return Set.update(setData, {
        where: { set_num },
    })
        .then(([rowsUpdated]) => {
            if (rowsUpdated === 0) throw new Error("No set found to update.");
            console.log(`Set with set_num ${set_num} updated successfully.`);
        })
        .catch(err => {
            if (err.errors && err.errors.length > 0) {
                throw new Error(err.errors[0].message);
            } else {
                throw new Error(`Unable to update set: ${err.message}`);
            }
        });
}

/**
 * Delete a set from the database.
 * @param {string} set_num - The set number of the set to delete.
 */
function deleteSet(set_num) {
    return Set.destroy({
        where: { set_num },
    })
        .then(rowsDeleted => {
            if (rowsDeleted === 0) throw new Error("No set found to delete");
            console.log(`Set with set_num ${set_num} deleted successfully.`);
        })
        .catch(err => {
            console.error("Error deleting set:", err);
            throw new Error(err.errors?.[0]?.message || "Unable to delete set");
        });
}



module.exports = { 
    initialize, 
    getAllSets, 
    getAllThemes, 
    getSetByNum, 
    getFeaturedSets, 
    addSet, 
    editSet, 
    deleteSet 
};
