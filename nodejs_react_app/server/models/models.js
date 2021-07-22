const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, unique: true,},
    password: {type: DataTypes.STRING},
    token: {type: DataTypes.UUID},
    rating: {type:DataTypes.FLOAT},

})

const Sop = sequelize.define('sop', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    tags: {type:DataTypes.STRING},
    link: {type: DataTypes.STRING},
    html: {type: DataTypes.STRING(5000)},
    //g: {type: DataTypes.JSON},
    rating: {type: DataTypes.FLOAT},
    rated_users: {type: DataTypes.ARRAY(DataTypes.INTEGER)},
    author: {type: DataTypes.STRING},
})

const Version = sequelize.define('version', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    number: {type: DataTypes.INTEGER},
    annotation: {type: DataTypes.STRING},
    link: {type: DataTypes.STRING},
    html: {type: DataTypes.STRING(5000)},
    rating: {type: DataTypes.FLOAT},
    rated_users: {type: DataTypes.ARRAY(DataTypes.INTEGER)},
    author: {type: DataTypes.STRING},
})

User.hasMany(Sop)
User.hasMany(Version)
Sop.hasMany(Version)

module.exports = {
    User,
    Sop,
    Version
}





