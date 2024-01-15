const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostSchema = new Schema({
    title: {type: String, required: true, min: 5}, 
    summary: {type: String, required: true, min: 5},  
    content: {type: String, required: true, min: 5}, 
    cover: {type: String, required: true, min: 5}, 
    author:{type: Schema.Types.ObjectId, ref: 'User', required: true}
}, {
    timestamps: true
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;