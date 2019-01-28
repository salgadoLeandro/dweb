var File = require('../../models/file');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports.list = () => {
    return File.find()
               .exec();
};

module.exports.find = (iid, uid) => {
    return File.findOne({_id: iid, user: uid})
               .exec();
};

module.exports.findPrivate = (fid, uid) => {
    return File.aggregate([{
        $match: { _id: fid }
    }, {
        $project: {
            _id: true,
            original: true,
            user: {'$toObjectId': '$user'}
        }
    }, {
        $lookup: {
            from: 'items',
            let: { file_id: '$_id' },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $in: ['$$file_id', '$attached_files']
                        }
                    }
                }
            ],
            as: 'items'
        }
    }, {
        $unwind: '$items'
    }, {
        $match: { 'items.privacy': { $in: ['semi', 'public'] } }
    }, {
        $project: {
            _id: true,
            original: true,
            user: true,
            'privacy': '$items.privacy'
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
                { 'user._id': ObjectId(uid) },
                { 'privacy': 'public' },
                { 'user.friends': { $in: [uid] } }
            ]
        }
    }, {
        $project: {
            _id: true,
            original: true
        }
    }]).exec();
}

module.exports.insert = fileinfo => {
    return File.create(fileinfo);
};

module.exports.delete = iid => {
    return File.findByIdAndDelete(iid);
};

module.exports.deleteMany = iids => {
    return File.deleteMany({_id: {$in: iids}});
};