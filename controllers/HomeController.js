class HomeController {

    async index(req, res) {
        res.send("APP EXPRESS! - Taxation is theft!");
    }

    async validateToken(req, res) {
        res.send('okay');
    }

}

module.exports = new HomeController();