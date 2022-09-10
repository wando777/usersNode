var jwt = require("jsonwebtoken");
var UserController = require("../controllers/UserController");

var secret = "minhastringquedefineotoken"

module.exports = function (req, res, next) {

    const authToken = req.headers['authorization']

    if (authToken != undefined) {
        const bearer = authToken.split(' ');
        var token = bearer[1];

        try {
            var decoded = jwt.verify(token, secret);

            if (decoded.role == 1) {
                next();
            } else {
                res.status(403);
                res.send("Role not authorized!")
                return;
            }
        } catch (error) {

            res.status(403);
            res.send("Authorization failed!")
            return;
        }

    } else {

        res.status(403);
        res.send("Authorization failed!")
        return;
    }

}