var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var Schema = mongoose.Schema;

var FileSchema = new Schema({
    _id: { type: String, required: true },
    user: { type: String, required: true },
    original: { type: String, required: true }
});

module.exports = mongoose.model('file', FileSchema);