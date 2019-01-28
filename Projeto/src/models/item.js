var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
    user: {type: String, required: true},
    date: {type: String, required: true},
    type: {type: String, default: 'status', enum: ['status', 'album', 'event'], required: true},
    local: {type: String},
    title: {type: String},
    text: {type: String, required: true},
    hashtags: {type: Array, default: [], required: true},
    attached_files: {type: Array, default: [], required: true},
    privacy: {type: String, default: 'private', enum: ['private', 'semi', 'public'], required: true},
    comments: [{
        timestamp: {type: String, required: true},
        author: {type: String, required: true},
        userid: {type: String, required: true},
        text: {type: String, required: true},
        replies: [{
            timestamp: {type: String, required: true},
            author: { type: String, required: true },
            userid: { type: String, required: true },
            text: {type: String, required: true}
        }]
    }]
});

ItemSchema.pre('save', async function (next) {
    var regex = /\#[^\s]*\b/gi;
    var tags = this.text.match(regex);
    if (tags)
        this.hashtags = tags;
    next();
});

module.exports = mongoose.model('item', ItemSchema);