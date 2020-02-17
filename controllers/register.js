// Controller for user registration
const controlRegister = (req, res, db, bcrypt) => {
    const { email, password , name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json('incorrect form submission');
    }
    bcrypt.hash(password, 10, function(err, hash) {
        db.transaction(trx => {
            trx.insert({
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                        joined: new Date()
                    })
                    .then(user => res.json(user[0]));
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => res.status(400).json('unable to register'));
    });
};

module.exports = {
    controlRegister: controlRegister
};