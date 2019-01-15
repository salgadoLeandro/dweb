var Compositor = require('../../models/compositor');

// Lista compositores
module.exports.listar = () => {
    return Compositor.find()
                     .sort({nome: 1})
                     .exec();
};

// Informação de um compositor
module.exports.consultar = cid => {
    return Compositor.findOne({_id: cid})
                     .exec();
};

// Listar compositores do período p
module.exports.listarPeriodo = periodo => {
    return Compositor.find({periodo: periodo})
                     .sort({nome: 1})
                     .exec();
};

// Listar compositores com data de nascimento superior a n
module.exports.listarDataNasc = dataNasc => {
    return Compositor.find({dataNasc: {$gte: dataNasc}})
                     .sort({nome: 1})
                     .exec();
};

// Combinação das duas funções anteriores
module.exports.listarPeD = (periodo, dataNasc) => {
    return Compositor.find({periodo: periodo, dataNasc: {$gte: dataNasc}})
                     .sort({nome: 1})
                     .exec();
};

module.exports.listarCondicional = (periodo, dataNasc) => {
    if (periodo && dataNasc) {
        return Compositor.find({
                            periodo: {$regex: ".*" + periodo.replace(/ /g, ".*") + ".*", $options:"i"}, 
                            dataNasc: {$gte: dataNasc}})
                         .sort({nome: 1})
                         .exec();
    }
    else if (periodo && !dataNasc) {
        return Compositor.find({periodo: {$regex: ".*" + periodo.replace(/ /g, ".*") + ".*", $options:"i"}})
                         .sort({nome: 1})
                         .exec();
    }
    else if (!periodo && dataNasc) {
        return Compositor.find({dataNasc: {$gte: dataNasc}})
                         .sort({nome: 1})
                         .exec();
    }
    else {
        return Compositor.find()
                         .sort({nome: 1})
                         .exec();
    }
}

// Inserir um compositor na lista
module.exports.inserir = compositor => {
    return Compositor.create(compositor);
};