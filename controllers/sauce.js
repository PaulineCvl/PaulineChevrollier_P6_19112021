const Sauce = require('../models/Sauce');
const User = require('../models/User');
const fs = require('fs');
const { Http2ServerRequest } = require('http2');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée' }))
        .catch(error => res.status(400).json({ error }));
}

exports.countLikes = (req, res, next) => {
    const like = req.body.like;

    User.findOne({ _id: req.body.userId })
        .then(() => {
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {
                    const usersLiked = sauce.usersLiked;
                    const usersDisliked = sauce.usersDisliked;

                    switch (like) {
                        case 1:
                            if (usersLiked.find(user => user == req.body.userId) == req.body.userId || usersDisliked.find(user => user == req.body.userId) == req.body.userId) {
                                throw '403: unauthorized request';
                            } else {
                                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: +1 }, $push: { usersLiked: req.body.userId } })
                                    .then(() => res.status(200).json({ message: 'Sauce likée' }))
                                    .catch(error => res.status(400).json({ error }));
                            }
                            break;
                        case -1:
                            if (usersLiked.find(user => user == req.body.userId) == req.body.userId || usersDisliked.find(user => user == req.body.userId) == req.body.userId) {
                                throw '403: unauthorized request';
                            } else {
                                Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: +1 }, $push: { usersDisliked: req.body.userId } })
                                    .then(() => res.status(200).json({ message: 'Sauce dislikée' }))
                                    .catch(error => res.status(400).json({ error }));
                            }
                            break;
                        case 0:
                            if (usersLiked.find(user => user == req.body.userId) == req.body.userId) {
                                Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } })
                                    .then(() => res.status(200).json({ message: 'Like supprimé' }))
                                    .catch(error => res.status(400).json({ error }));
                            }
                            else if (usersDisliked.find(user => user == req.body.userId) == req.body.userId) {
                                Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } })
                                    .then(() => res.status(200).json({ message: 'Dislike supprimé' }))
                                    .catch(error => res.status(400).json({ error }));
                            }
                            else {
                                throw '403: unauthorized request';
                            }
                            break;
                        default:
                            throw '403: unauthorized request';
                    }
                })
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(400).json({ error }));
}

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
}

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {
            ...req.body
        };
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
                        .catch(error => res.status(400).json({ error }));
                });
            })
            .catch(error => res.status(400).json({error}));
    } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
            .catch(error => res.status(400).json({ error }));
    }
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
}