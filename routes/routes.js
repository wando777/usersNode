var express = require("express")
var app = express();
var router = express.Router();
var HomeController = require("../controllers/HomeController");
var UserController = require("../controllers/UserController");
var adminAuth = require("../middleware/AdminAuth");

router.get('/', HomeController.index);
router.post('/user', UserController.create);
router.get("/user", adminAuth, UserController.index);
router.get("/user/:id", UserController.getUser);
router.put("/user", UserController.editUser);
router.delete("/user/:id", adminAuth, UserController.deleteUser);

router.post("/recoverypassword", UserController.recoveryPassword);
router.post("/changepassword", UserController.changePassword);

router.post("/login", UserController.login);

router.post("/validate", adminAuth, HomeController.validateToken);

module.exports = router;