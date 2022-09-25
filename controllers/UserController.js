var User = require("../models/User");
var PasswordToken = require("../models/PasswordToken");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

var secret = "minhastringquedefineotoken"

class UserController {

    async index(req, res) {
        var users = await User.findAllUsers();
        res.json(users);
    }

    async getUser(req, res) {
        var userId = req.params.id;
        var user = await User.findUserById(userId);
        if (user == undefined) {
            res.status(404);
            res.json({});
        } else {
            res.status(200);
            res.json(user);
        }
    }

    async create(req, res) {
        //console.log(req.body);
        var { email, name, password } = req.body;

        //Undefined
        if (email == undefined || name == undefined || password == undefined) {
            res.status(400);
            res.json({
                err: "invalid parameter!"
            })
            return;
        }
        //Empty
        if (email == '' || name == '' || password == '') {
            res.status(400);
            res.json({
                err: "invalid parameter!"
            })
            return;
        }

        var emailExists = await User.findEmail(email);
        if (emailExists) {
            res.status(406);
            res.json({
                err: "This email is being used!"
            });
            return;
        }

        await User.newUser(email, password, name);

        res.status(200);
        res.send("The user has been registered");
    }

    async editUser(req, res) {
        var { id, email, name, role } = req.body;
        var result = await User.updateUser(id, email, name, role);
        if (result == undefined) {
            res.status(404);
            res.json({
                err: "User not found"
            });
        } else {
            if (result.status) {
                res.status(200);
                res.send("It worked!");
            } else {
                res.status(406);
                res.json({
                    err: result.err
                });
            }
        }
    }

    async deleteUser(req, res) {
        var userId = req.params.id;
        var result = await User.deleteUserById(userId);
        if (!result.status) {
            res.status(404);
            res.json({
                err: result.err
            });
        } else {
            res.status(200);
            res.send(`The user with id: ${userId} has been deleted`);
        }
    }

    async recoveryPassword(req, res) {
        var email = req.body.email;
        var result = await PasswordToken.create(email);
        if (result.status) {
            res.status(200);
            res.send(result.token.toString());
        } else {
            res.status(406);
            res.send(result.err);
        }
    }

    async changePassword(req, res) {
        var token = req.body.token;
        var password = req.body.password;

        var isTokenValid = await PasswordToken.validate(token);

        if (isTokenValid.status) {
            await User.changePassword(password, isTokenValid.token.user_id, isTokenValid.token.token);
            await PasswordToken.setUsed(token);
            res.status(200);
            res.send("The password has been changed!")
            return;
        } else {
            res.status(406);
            res.send("Invalid token");
            return;
        }

    }

    async login(req, res) {
        var { email, password } = req.body;
        var user = await User.findUserByEmailWithPassword(email);

        if (user == undefined) {
            res.status(404);
            res.json({
                status: false,
                err: "This user does not exist!"
            })
        } else {
            var result = await bcrypt.compare(password, user.password);

            if (result) {
                var token = jwt.sign({
                    email: user.email,
                    role: user.role
                },
                    secret);
                res.status(200);
                res.json({
                    token: token
                })
            } else {
                res.status(406);
                res.json({
                    err: "invalid password"
                })
                //res.send("invalid password")
            }
        }
    }
}

module.exports = new UserController();