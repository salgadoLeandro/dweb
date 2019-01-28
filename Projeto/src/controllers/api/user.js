var mongoose = require('mongoose');
var User = require('../../models/user');
var ObjectId = mongoose.Types.ObjectId;

var pageSize = 30;

// List users
module.exports.list = () => {
    return User.find()
               .exec();
};

// List users, considering privacy details
module.exports.listPrivate = (cid, page) => {
    return User.aggregate([{
        $project: {
            email: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$email',
                    '$$REMOVE'
                ]
            },
            name: true,
            gender: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$gender',
                    '$$REMOVE'
                ]
            },
            birthdate: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$birthdate',
                    '$$REMOVE'
                ]
            },
            contacts: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$contacts',
                    '$$REMOVE'
                ]
            },
            items: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$items',
                    '$$REMOVE'
                ]
            },
            privacy: true
        }
    }, {
        $sort: { name: 1 }
    }, {
        $skip: (page - 1) * pageSize
    }, {
        $limit: pageSize
    }]).exec();
};


// List users by name
module.exports.listName = name => {
    var tmp = name.replace(/ /g, ".*");
    return User.find({name: {$regex: ".*" + tmp + ".*", $options: "i"}})
               .sort({name: 1})
               .exec();
};

// List users by name, considering privacy details
module.exports.listNamePrivate = (cid, name, page) => {
    var tmp = name.replace(/ /g, ".*");
    return User.aggregate([{
        $project: {
            email: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$email',
                    '$$REMOVE'
                ]
            },
            name: true,
            gender: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$gender',
                    '$$REMOVE'
                ]
            },
            birthdate: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$birthdate',
                    '$$REMOVE'
                ]
            },
            contacts: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$contacts',
                    '$$REMOVE'
                ]
            },
            items: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$items',
                    '$$REMOVE'
                ]
            },
            privacy: true
        }
    }, {
        $match: {
            name: {$regex: ".*" + tmp + ".*", $options: "i"}
        }
    }, {
        $sort: { name: 1 }
    }, {
        $skip: (page - 1) * pageSize
    }, {
        $limit: pageSize
    }]).exec();
};


// Get user information by id
module.exports.getUser = uid => {
    return User.findOne({_id: uid})
               .exec();
};

// Get user information by id, considering privacy details
module.exports.getUserPrivate = (cid, uid) => {    
    return User.aggregate([{
        $project: {
            email: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$_id', ObjectId(cid)]},
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$email',
                    '$$REMOVE'
                ]
            },
            name: true,
            gender: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$_id', ObjectId(cid)]},
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$gender',
                    '$$REMOVE'
                ]
            },
            birthdate: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$_id', ObjectId(cid)]},
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$birthdate',
                    '$$REMOVE'
                ]
            },
            contacts: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$_id', ObjectId(cid)]},
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$contacts',
                    '$$REMOVE'
                ]
            },
            items: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$_id', ObjectId(cid)]},
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$items',
                    '$$REMOVE'
                ]
            },
            requests: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$_id', ObjectId(cid)]},
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$requests',
                    '$$REMOVE'
                ]
            },
            friends: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$_id', ObjectId(cid)]},
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$friends',
                    '$$REMOVE'
                ]
            },
            privacy: true,
            'notfriend': {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$_id', ObjectId(cid)] },
                            { $setIsSubset: [[cid], '$friends'] }
                        ]
                    },
                    false,
                    true
                ]
            },
            'requested': {
                $cond: [
                    { $setIsSubset: [[cid], '$requests'] },
                    true,
                    false
                ]
            }
        }
    }, {
        $match: {
            _id: ObjectId(uid)
        }
    }, {
        $unwind: { path: '$items', preserveNullAndEmptyArrays: true }
    }, {
        $project: {
            email: true,
            name: true,
            privacy: true,
            gender: true,
            birthdate: true,
            contacts: true,
            requests: true,
            friends: true,
            items: {'$toObjectId': '$items'},
            notfriend: true,
            requested: true
        }
    }, {
        $lookup: {
            from: 'items',
            localField: 'items',
            foreignField: '_id',
            as: 'items'
        }
    }, {
        $unwind: { path: '$items', preserveNullAndEmptyArrays: true }
    }, {
        $group: {
            _id: '$_id',
            email: { $first: '$email' },
            name: { $first: '$name' },
            privacy: { $first: '$privacy' },
            gender: { $first: '$gender' },
            birthdate: { $first: '$birthdate' },
            contacts: { $first: '$contacts' },
            requests: { $first: '$requests' },
            items: { $push: '$items' },
            friends: { $first: '$friends' },
            notfriend: { $first: '$notfriend' },
            requested: { $first: '$requested' }
        }
    }, {
        $unwind: { path: '$requests', preserveNullAndEmptyArrays: true }
    }, {
        $project: {
            email: true,
            name: true,
            privacy: true,
            gender: true,
            birthdate: true,
            contacts: true,
            requests: {'$toObjectId': '$requests'},
            friends: true,
            items: true,
            notfriend: true,
            requested: true
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'requests',
            foreignField: '_id',
            as: 'requests'
        }
    }, {
        $unwind: { path: '$requests', preserveNullAndEmptyArrays: true }
    }, {
        $project: {
            email: true,
            name: true,
            privacy: true,
            gender: true,
            birthdate: true,
            contacts: true,
            items: true,
            friends: true,
            notfriend: true,
            requested: true,
            'requests._id': true,
            'requests.name': true
        }
    }, {
        $group: {
            _id: '$_id',
            email: { $first: '$email' },
            name: { $first: '$name' },
            privacy: { $first: '$privacy' },
            gender: { $first: '$gender' },
            birthdate: { $first: '$birthdate' },
            contacts: { $first: '$contacts' },
            items: { $first: '$items' },
            friends: { $first: '$friends' },
            notfriend: { $first: '$notfriend' },
            requested: { $first: '$requested' },
            requests: { $push: '$requests' }
        }
    }]).exec();
};


// Get user information by email
module.exports.getUserEmail = email => {
    return User.findOne({email: email})
               .exec();
};

// Get user information by email, considering privacy detail
module.exports.getUserEmailPrivate = (cid, email) => {
    return User.aggregate([{
        $project: {
            email: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$email',
                    '$$REMOVE'
                ]
            },
            name: true,
            gender: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$gender',
                    '$$REMOVE'
                ]
            },
            birthdate: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$birthdate',
                    '$$REMOVE'
                ]
            },
            contacts: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$contacts',
                    '$$REMOVE'
                ]
            },
            items: {
                $cond: [
                    {
                        $or: [
                            { $eq: ['$privacy', 'public'] },
                            {
                                $and: [
                                    { $eq: ['$privacy', 'semi'] },
                                    { $setIsSubset: [[cid], '$friends'] }
                                ]
                            }
                        ]
                    },
                    '$items',
                    '$$REMOVE'
                ]
            },
            privacy: true
        }
    }, {
        $match: {
            email: email
        }
    }]).exec();
};

// Get user timeline
module.exports.getTimeline = (cid, page) => {
    if (!page)
        page = 1;
    return User.aggregate([{
        $match: {
            $or: [
                { _id: ObjectId(cid) },
                {
                    $and: [
                        { privacy: 'semi' },
                        { friends: { $in: [cid] } }
                    ]
                }
            ]
        }
    }, {
        $project: {
            _id: { $toString: '$_id' },
            name: true
        }
    }, {
        $lookup: {
            from: 'items',
            localField: '_id',
            foreignField: 'user',
            as: 'items'
        }
    }, {
        $unwind: '$items'
    }, {
        $match: {
            $or: [
                { 'items.user': cid },
                { 'items.privacy': {$in: ['public', 'semi']} }
            ]
        }
    }, {
        $project: {
            name: true,
            itemid: '$items._id',
            date: '$items.date',
            type: '$items.type',
            local: '$items.local',
            title: '$items.title',
            text: '$items.text',
            comments: '$items.comments',
            files: '$items.attached_files'
        }
    }, {
        $sort: {date: -1}
    }, {
        $skip: (page - 1) * pageSize
    }, {
        $limit: pageSize
    }, {
        $unwind: { path: '$files', preserveNullAndEmptyArrays: true }
    }, {
        $lookup: {
            from: 'files',
            localField: 'files',
            foreignField: '_id',
            as: 'files'
        }
    }, {
        $unwind: { path: '$files', preserveNullAndEmptyArrays: true }
    }, {
        $group: {
            _id: '$itemid',
            userid: { $first: '$_id' },
            name: { $first: '$name'},
            date: { $first: '$date' },
            type: { $first: '$type' },
            local: { $first: '$local' },
            title: { $first: '$title' },
            text: { $first: '$text' },
            comments: { $first: '$comments' },
            files: { $push: '$files' }
        }
    }, {
        $project: {
            userid: true,
            name: true,
            date: true,
            type: true,
            local: { $ifNull: ['$local', '$$REMOVE'] },
            title: { $ifNull: ['$title', '$$REMOVE'] },
            text: true,
            comments: true,
            'files._id': true,
            'files.original': true
        }
    }]).exec();
};

// Update user
module.exports.update = (uid, info) => {
    if (info.requests) delete info.requests;
    if (info.contacts) delete info.contacts;
    if (info.friends) delete info.friends;
    if (info.items) delete info.items;
    return User.findByIdAndUpdate(uid, info, { 
        new: true, 
        fields: {
            email: true,
            name: true,
            gender: true,
            birthdate: true,
            contacts: true,
            friends: true,
            items: true,
            requests: true,
            privacy: true
        } 
    });
}

// Update multiple users
module.exports.updateMany = (query, update) => {
    return User.updateMany(query, update);
}

// Insert user
module.exports.insert = user => {
    return User.create(user);
};

//Delete user
module.exports.delete = uid => {
    return User.findByIdAndDelete(uid);
}