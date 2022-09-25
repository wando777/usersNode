var knex = require("../database/connection");
var bcrypt = require("bcrypt");

class User {

    async findAllUsers() {
        try {
            var result = await knex.select(["id", "name", "email", "role"]).table("users");
            return result;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async findUserById(_id) {
        try {
            var result = await knex.select(["id", "name", "email", "role"]).where({ id: _id }).table("users");

            if (result.length > 0) {
                return result[0];
            } else {
                return undefined;
            }
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    async findUserByEmail(_email) {
        try {
            var result = await knex.select(["id", "name", "email", "role"]).where({ email: _email }).table("users");

            if (result.length > 0) {
                return result[0];
            } else {
                return undefined;
            }
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    async findUserByEmailWithPassword(_email) {
        try {
            var result = await knex.select(["id", "name", "email", "password", "role"]).where({ email: _email }).table("users");

            if (result.length > 0) {
                return result[0];
            } else {
                return undefined;
            }
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    async newUser(email, password, name) {

        try {
            var hash = await bcrypt.hash(password, 10);
            await knex.insert({ email, password: hash, name, role: 0 }).table("users");
        } catch (err) {
            console.log(err);
        }
    }

    async findEmail(_email) {
        try {
            var emailResult = await knex.select("*").from("users").where({ email: _email });
            //console.log(emailResult)
            if (emailResult.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateUser(id, email, name, role) {
        var user = await this.findUserById(id);

        if (user == undefined) {
            return { status: false, err: "Can't do this operation. This user does not exist!" }
        } else {
            var editedUser = {}; //Empty user to be fullfiled

            //E-mail edition
            if (email != undefined) {
                if (email != user.email) {
                    var result = await this.findEmail(email);
                    if (!result) {
                        editedUser.email = email;
                    } else {
                        return { status: false, err: "Can't do this operation. This email is already being used!" }
                    }
                } // In case of receving the same e-mail, we do not do nothing, it sends a 200 OK, because there's no error despite nothing is changed.
            } else {
                return { status: false, err: "Can't do this operation. No sent email!" }
            }

            //Name edition
            if (name != undefined) {
                if (name != user.name) {
                    editedUser.name = name;
                }
            } else {
                return { status: false, err: "Can't do this operation. No sent name!" }
            }

            //Role edition
            if (role != undefined) {
                if (role != user.role) {
                    editedUser.role = role;
                }
            } else {
                return { status: false, err: "Can't do this operation. No sent role!" }
            }

            //Updating the database
            try {
                await knex.update(editedUser).where({ id: id }).table("users");
                return { status: true };
            } catch (error) {
                return { status: false, err: error }
            }
        }
    }

    async deleteUserById(_id) {
        var user = await this.findUserById(_id);
        if (user == undefined) {
            return { status: false, err: "Can't do this operation. This user does not exist!" }
        } else {
            try {
                await knex.delete().where({ id: _id }).table("users");
                return { status: true };
            } catch (error) {
                return { status: false, err: error }
            }
        }
    }

    async changePassword(newPassword, id, token) {
        var hash = await bcrypt.hash(newPassword, 10);
        try {
            await knex.update({ password: hash }).where({ id: id }).table("users");
            return { status: true };
        } catch (error) {
            return { status: false, err: error }
        }
    }

}

module.exports = new User();