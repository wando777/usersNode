var knex = require("../database/connection");
var User = require("./User");

class PasswordToken {

    async create(email) {
        var user = await User.findUserByEmail(email);
        if (user != undefined) {
            try {
                var token = Date.now();
                await knex.insert({
                    user_id: user.id,
                    used: 0,
                    token: token //UUID
                }).table("passwordtokens")
                return { status: true, token: token };
            } catch (error) {
                return { status: false, err: error }
            }
        } else {
            return { status: false, err: "Email not registered." }
        }
    }

    async validate(token) {
        try {
            var result = await knex.select().where({ token: token }).table("passwordtokens");
            if (result.length > 0) {
                var tk = result[0];
                if (tk.used == 0) {
                    return { status: true, token: tk }; //0 is false, so this token was never used, then it's valid.
                } else {
                    return { status: false };
                }
            } else {
                return { status: false };
            }
        } catch (error) {
            console.log(error);
            return { status: false };
        }
    }

    async setUsed(token) {
        try {
            await knex.update({ used: 1 }).where({ token: token }).table("passwordtokens");
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

}

module.exports = new PasswordToken();