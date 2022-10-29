const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    value: String,
    team_name: String,
    team_year: String,
    type: String,
    sport: String,
    classe: String,
})

module.exports = ProductSchema