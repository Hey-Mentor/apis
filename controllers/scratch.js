exports.create_a_mentee = function(req, res) {
    var new_mentee = new Mentee(req.body);
    new_mentee.save(function(err, mentee) {
        if (err)
            res.send(err);
        res.json(mentee);
    });
};

exports.read_a_mentee = function(req, res) {
    Mentees.findById(req.params.menteeId, function(err, mentee) {
        if (err)
            res.send(err);
        res.json(mentee);
    });
};

exports.update_a_mentee = function(req, res) {
    Mentee.findOneAndUpdate({_id: req.params.menteeId}, req.body, {new: true}, function(err, mentee) {
        if (err)
            res.send(err);
        res.json(mentee);
    });
};

exports.delete_a_mentee = function(req, res) {
    Mentee.remove({
        _id: req.params.menteeId
    }, function(err, mentee) {
        if (err)
            res.send(err);
        res.json({ message: 'Mentee successfully deleted' });
    });
};


  // data: '{"user_ids":["zlmlyyensklvjklsne","nelskjklenfjlsenv"],"is_distinct":true}' },