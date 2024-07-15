const express = require("express");
const UserSchema = require("../models/UserSchema");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchuser");

JWT_SECRET = "SudhanshuCoolBoy@Cool";

const router = express.Router();

// ROUTE 1 => Create User: Endpoint - POST "/api/v1/auth/createuser" ::: No Login Required!
router.post(
	"/createuser",
	body("name", "Enter a valid Name!!!").isLength({ min: 3 }),
	body("email", "Enter a valid Email!!!").isEmail(),
	body("password", "Password is of atleast 5 characters").isLength({ min: 5 }),
	async (req, res) => {
		// If error occurs then return Bad Request with error!!!
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		try {
			// check if user already exist, if yesr then throw error, else create newUser
			let newUser = await UserSchema.findOne({ email: req.body.email });
			if (newUser) {
				console.log(res.statusCode);
				return res.status(400).json({
					status: res.statusCode,
					error: "Duplicate Email!",
					message: `A User with this email <${req.body.email}> is already Exist!!!`,
				});
			}
			// encrypting user password - hashing and salting using bcryptjs
			const salt = await bcrypt.genSaltSync(10);
			const securePass = await bcrypt.hashSync(req.body.password, salt);

			// creating new user - UserSchema
			newUser = await UserSchema.create({
				name: req.body.name,
				email: req.body.email,
				password: securePass,
			});

			const data = {
				user: {
					id: newUser.id,
				},
			};
			const authToken = jwt.sign(data, JWT_SECRET);

			res.json({
				status: res.statusCode,
				userId: newUser.id,
				message: "New User Created!",
				authToken,
			});
		} catch (error) {
			console.error(error);
			res.status(500).send({
				status: res.statusCode,
				error: "No User created! Some Error Occurred!!!",
				message: error,
			});
		}
	}
);

// ROUTE 2 => Login User: Endpoint - POST "/api/v1/auth/login" ::: No Login Required!
router.post(
	"/login",
	body("email", "Enter a valid Email!!!").isEmail(),
	body("password", "Password length not equal to 0!").exists(),
	async (req, res) => {
		// If error occurs then return Bad Request with error!!!
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		try {
			let { email, password } = req.body;

			const checkUser = await UserSchema.findOne({ email });
			if (!checkUser) {
				return res.status(400).json({
					status: res.statusCode,
					error: "Invalid Credentials!",
					message: "Please enter a vaild credentials!",
				});
			}

			const checkUserPass = await bcrypt.compare(password, checkUser.password);
			if (!checkUserPass) {
				return res.status(400).json({
					status: res.statusCode,
					error: "Invalid Credentials!",
					message: "Please enter a vaild credentials!",
				});
			}

			const data = {
				user: {
					id: checkUser.id,
				},
			};

			const authToken = jwt.sign(data, JWT_SECRET);

			res.json({
				status: res.statusCode,
				userId: checkUser.id,
				message: "User Authenticated Successfully!",
				authToken,
			});
		} catch (error) {
			res.status(500).send({
				status: res.statusCode,
				error: "Internal Server Occurred!",
				message: error,
			});
		}
	}
);

// ROUTE 3 => Get loggedIn User Data: Endpoint - POST "/api/v1/auth/getuser" ::: Login Required!
router.post('/getuser', fetchUser, async (req, res) => {
	try {
		let getUserID = req.user.id;

		let userData = await UserSchema.findById( getUserID );

		res.send(userData);
	} catch (error) {
		return res.status(401).json({
			status: res.statusCode,
			error: "Invalid User Token!",
			message: error,
		});
	}
});

module.exports = router;
