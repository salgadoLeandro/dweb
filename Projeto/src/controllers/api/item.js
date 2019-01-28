var mongoose = require('mongoose');
var Item = require('../../models/item');
var ObjectId = mongoose.Types.ObjectId;

var pageSize = 20;

module.exports.list = () => {
    return Item.find()
               .exec();
}

// Get item, considering privacy details
module.exports.getItem = (cid, iid) => {
    return Item.aggregate([{
        $match:{
            _id: ObjectId(iid)}
    }, {
        $project: {
            user: {'$toObjectId': '$user'},
            date: true,
            type: true,
            local: true,
            title: true,
            text: true,
            comments: true,
            attached_files: true,
            privacy: true
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
        }
    }, {
        $unwind: '$user'
    }, {
        $match: {
            $or: [
                {'user._id': ObjectId(cid)},
                {privacy: 'public'},
                {$and: [
                    {privacy: 'semi'},
                    {friends: {$in: [cid]}}
                ]}
            ]
        }
    }, {
        $project: {
            date: true,
            type: true,
            local: true,
            title: true,
            text: true,
            comments: true,
            attached_files: true,
            privacy: true,
            'user_id': '$user._id',
            'user_name': '$user.name'
        }
    }, {
        $unwind: { path: '$attached_files', preserveNullAndEmptyArrays: true }
    }, {
        $lookup: {
            from: 'files',
            localField: 'attached_files',
            foreignField: '_id',
            as: 'files'
        }
    }, {
        $unwind: { path: '$files', preserveNullAndEmptyArrays: true }
    }, {
        $group: {
            _id: '$_id',
            type: { $first: '$type' },
            privacy: { $first: '$privacy' },
            local: { $first: '$local' },
            title: { $first: '$title' },
            text: { $first: '$text' },
            date: { $first: '$date' },
            comments: { $first: '$comments' },
            user_id: { $first: '$user_id' },
            user_name: { $first: '$user_name' },
            files: { $push: '$files' }
        }
    }, {
        $project: {
            type: true,
            privacy: true,
            local: { $ifNull: ['$local', '$$REMOVE'] },
            title: { $ifNull: ['$title', '$$REMOVE'] },
            text: true,
            date: true,
            user_id: true,
            user_name: true,
            comments: true,
            user_id: true,
            user_name: true,
            'files._id': true,
            'files.original': true
        }
    }]).exec();
};

// Search by hashtags
module.exports.searchHash = (cid, hash, page) => {
    return Item.aggregate([{
        $match: { hashtags : hash }
    }, {
        $project: {
            user: {'$toObjectId': '$user'},
            date: true,
            type: true,
            local: true,
            title: true,
            text: true,
            comments: true,
            attached_files: true,
            privacy: true
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
        }
    }, {
        $unwind: '$user'
    }, {
        $match: {
            $or: [
                {'user._id': ObjectId(cid)},
                {privacy: 'public'},
                {$and: [
                    {privacy: 'semi'},
                    {friends: {$in: [cid]}}
                ]}
            ]
        }
    }, {
        $project: {
            date: true,
            type: true,
            local: true,
            title: true,
            text: true,
            comments: true,
            attached_files: true,
            privacy: true,
            'user_id': '$user._id',
            'user_name': '$user.name'
        }
    }, {
        $sort: { date: -1 }
    }, {
        $skip: (page - 1) * pageSize
    }, {
        $limit: pageSize
    }, {
        $unwind: { path: '$attached_files', preserveNullAndEmptyArrays: true }
    }, {
        $lookup: {
            from: 'files',
            localField: 'attached_files',
            foreignField: '_id',
            as: 'files'
        }
    }, {
        $unwind: { path: '$files', preserveNullAndEmptyArrays: true }
    }, {
        $group: {
            _id: '$_id',
            type: { $first: '$type' },
            privacy: { $first: '$privacy' },
            local: { $first: '$local' },
            title: { $first: '$title' },
            text: { $first: '$text' },
            date: { $first: '$date' },
            comments: { $first: '$comments' },
            user_id: { $first: '$user_id' },
            user_name: { $first: '$user_name' },
            files: { $push: '$files' }
        }
    }, {
        $project: {
            type: true,
            privacy: true,
            local: { $ifNull: ['$local', '$$REMOVE'] },
            title: { $ifNull: ['$title', '$$REMOVE'] },
            text: true,
            date: true,
            user_id: true,
            user_name: true,
            comments: true,
            user_id: true,
            user_name: true,
            'files._id': true,
            'files.original': true
        }
    }]).exec();
};


module.exports.update = (iid, info) => {
    return Item.findByIdAndUpdate(iid, info, {new: true});
};

module.exports.insert = (uid, item) => {
    item.user = uid;
    item.date = item.date.replace(/[a-z].*/gi, '');
    return Item.create(item);
};

module.exports.checkAccess = (cid, iid) => {
    return Item.aggregate([{
        $match: { _id: ObjectId(iid) }
    }, {
        $project: { 
            user: { '$toObjectId': '$user' },
            privacy: true
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
        }
    }, {
        $unwind: '$user'
    }, {
        $match: {
            $or: [
                { 'user._id': ObjectId(cid) },
                { privacy: 'public' },
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
            _id: true,
            'author': ObjectId(cid)
        }
    }, {
        $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author'
        }
    }, {
        $unwind: '$author'
    }, {
        $project: {
            _id: true,
            author: '$author.name'
        }
    }]).exec();
};

module.exports.delete = iid => {
    return Item.findByIdAndDelete(iid);
};

module.exports.deleteMany = iids => {
    return Item.findByIdAndDelete({_id: {$in: iids}});
};

module.exports.import = item => {
    return Item.create(item);
};