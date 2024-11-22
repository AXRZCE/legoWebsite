// require('dotenv').config();
// const Sequelize = require('sequelize');
// require('pg'); // Add this line

// // Initialize Sequelize connection with SSL and specify 'dialectModule'
// const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     dialect: 'postgres',
//     dialectOptions: {
//         ssl: {
//             rejectUnauthorized: false, // Allow self-signed certificates
//         },
//     },
// });

// // The rest of your code remains unchanged

// // Define the Theme model
// const Theme = sequelize.define('Theme', {
//     id: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
// }, {
//     timestamps: false, // Disable createdAt and updatedAt
// });

// // Define the Set model
// const Set = sequelize.define('Set', {
//     set_num: {
//         type: Sequelize.STRING,
//         primaryKey: true,
//     },
//     name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//     },
//     year: {
//         type: Sequelize.INTEGER,
//     },
//     num_parts: {
//         type: Sequelize.INTEGER,
//     },
//     theme_id: {
//         type: Sequelize.INTEGER,
//     },
//     img_url: {
//         type: Sequelize.STRING,
//     },
// }, {
//     timestamps: false, // Disable createdAt and updatedAt
// });

// // Create associations between models
// Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// /**
//  * Initialize the database connection and synchronize models.
//  */
// function initialize() {
//     return sequelize.sync()
//         .then(() => {
//             console.log("Database connection established and models synchronized.");
//         })
//         .catch(err => {
//             console.error("Error initializing database:", err);
//             throw new Error("Unable to initialize database");
//         });
// }

// /**
//  * Get all sets from the database, optionally filtered by a theme.
//  */
// function getAllSets(themeFilter) {
//     console.log("Fetching all sets with theme filter:", themeFilter);
//     const options = { include: [Theme] };

//     if (themeFilter) {
//         options.where = { '$Theme.name$': themeFilter };
//     }

//     return Set.findAll(options)
//         .then(sets => {
//             console.log("Sets fetched successfully.");
//             return sets.map(set => ({
//                 set_num: set.set_num,
//                 name: set.name,
//                 year: set.year,
//                 num_parts: set.num_parts,
//                 theme: set.Theme ? set.Theme.name : "Unknown",
//                 img_url: set.img_url,
//             }));
//         })
//         .catch(err => {
//             console.error("Error fetching sets:", err);
//             throw err;
//         });
// }

// /**
//  * Get all themes from the database.
//  */
// function getAllThemes() {
//     console.log("Fetching all themes...");
//     return Theme.findAll({ attributes: ['id', 'name'] })
//         .then(themes => {
//             console.log("Themes fetched successfully.");
//             return themes;
//         })
//         .catch(err => {
//             console.error("Error fetching themes:", err);
//             throw err;
//         });
// }

// /**
//  * Get a set by its set number.
//  */
// function getSetByNum(setNum) {
//     console.log("Fetching set by number:", setNum);
//     return Set.findOne({ where: { set_num: setNum }, include: [Theme] })
//         .then(set => {
//             if (!set) {
//                 throw new Error("Set not found");
//             }
//             console.log("Set fetched successfully:", set);
//             return {
//                 set_num: set.set_num,
//                 name: set.name,
//                 year: set.year,
//                 num_parts: set.num_parts,
//                 theme: set.Theme ? set.Theme.name : "Unknown",
//                 img_url: set.img_url,
//             };
//         })
//         .catch(err => {
//             console.error("Error fetching set:", err);
//             throw err;
//         });
// }

// /**
//  * Add a new set to the database.
//  */
// function addSet(setData) {
//     console.log("Adding new set:", setData);
//     return Set.create(setData)
//         .then(() => {
//             console.log("Set added successfully.");
//         })
//         .catch(err => {
//             console.error("Error adding set:", err);
//             throw err;
//         });
// }

// /**
//  * Edit an existing set in the database.
//  */
// function editSet(set_num, setData) {
//     console.log("Editing set:", set_num);
//     return Set.update(setData, { where: { set_num } })
//         .then(([rowsUpdated]) => {
//             if (rowsUpdated === 0) throw new Error("No set found to update.");
//             console.log("Set updated successfully.");
//         })
//         .catch(err => {
//             console.error("Error updating set:", err);
//             throw err;
//         });
// }

// /**
//  * Delete a set from the database.
//  */
// function deleteSet(set_num) {
//     console.log("Deleting set:", set_num);
//     return Set.destroy({ where: { set_num } })
//         .then(rowsDeleted => {
//             if (rowsDeleted === 0) throw new Error("No set found to delete");
//             console.log("Set deleted successfully.");
//         })
//         .catch(err => {
//             console.error("Error deleting set:", err);
//             throw err;
//         });
// }

// function getFeaturedSets() {
//     console.log("Fetching featured sets...");
//     return Set.findAll({
//         limit: 6,
//         include: [Theme],
//     }).then(sets => sets.map(set => ({
//         set_num: set.set_num,
//         name: set.name,
//         year: set.year,
//         num_parts: set.num_parts,
//         theme: set.Theme ? set.Theme.name : "Unknown",
//         img_url: set.img_url,
//     })));
// }

// module.exports = {
//     initialize,
//     getAllSets,
//     getAllThemes,
//     getSetByNum,
//     addSet,
//     editSet,
//     deleteSet,
//     getFeaturedSets,
// };

require('dotenv').config();

const Sequelize = require('sequelize');

//set up sequelize to point to our postgres database
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
      primaryKey: true, // use "id" as a primary key
      autoIncrement: true, // automatically increment the value

    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

// Set model

const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true, // use "set_num" as a primary key
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'})

// Note, extra wrapper promises added for simplicity and greater control over error messages

function initialize() { 
  return new Promise(async (resolve, reject) => {
    try{
      await sequelize.sync();
      resolve();
    }catch(err){
      reject(err.message)
    }
  });

}

function getAllSets() {

  return new Promise(async (resolve,reject)=>{
    let sets = await Set.findAll({include: [Theme]});
    resolve(sets);
  });
   
}

function getAllThemes() {

  return new Promise(async (resolve,reject)=>{
    let themes = await Theme.findAll();
    resolve(themes);
  });
   
}

function getSetByNum(setNum) {

  return new Promise(async (resolve, reject) => {
    let foundSet = await Set.findAll({include: [Theme], where: { set_num: setNum}});
 
    if (foundSet.length > 0) {
      resolve(foundSet[0]);
    } else {
      reject("Unable to find requested set");
    }

  });

}

function getSetsByTheme(theme) {

  return new Promise(async (resolve, reject) => {
    let foundSets = await Set.findAll({include: [Theme], where: { 
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`
      }
    }});
 
    if (foundSets.length > 0) {
      resolve(foundSets);
    } else {
      reject("Unable to find requested sets");
    }

  });

}

function addSet(setData){
  return new Promise(async (resolve,reject)=>{
    try{
      await Set.create(setData);
      resolve();
    }catch(err){
      reject(err.errors[0].message)
    }
  });
}

function editSet(set_num, setData){
  return new Promise(async (resolve,reject)=>{
    try {
      await Set.update(setData,{where: {set_num: set_num}})
      resolve();
    }catch(err){
      reject(err.errors[0].message);
    }
  });
}

function deleteSet(set_num){
  return new Promise(async (resolve,reject)=>{
    try{
      await Set.destroy({
        where: { set_num: set_num }
      });
      resolve();
    }catch(err){
      reject(err.errors[0].message);
    }
   
  });
  
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet }


