var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email : {type: String, required: true, unique: true, index: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    gender: {type: String, enum: ['male', 'female'], required: true},
    birthdate: {type: String, required: true},
    contacts: {type: Array, default: [], required: true},
    friends: {type: Array, default: [], required: true},
    items: {type: Array, default: [], required: true},
    requests: {type: Array, default: [], required: true},
    privacy: {type: String, default: 'private', enum: ['private', 'semi', 'public'], required: true}
});

UserSchema.pre('save', async function(next){
    var hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

UserSchema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('user', UserSchema);