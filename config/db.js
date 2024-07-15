const mongoose = require("mongoose");

const mongoURI = 'mongodb://localhost:27017/inotebook'

const connectToMongo = () => {
    // console.log("Connected to Mongo Successfully!")
    mongoose.connect(mongoURI).then( ()=> {
        console.log("Connected to Mongo Successfully!")
    })
}

module.exports =  connectToMongo;