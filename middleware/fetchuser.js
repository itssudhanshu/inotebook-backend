var jwt = require("jsonwebtoken");

JWT_SECRET = "SudhanshuCoolBoy@Cool";

const fetchUser = (req, res, next) => {
	const fetchAuthToken = req.header("auth-token");
	if (!fetchAuthToken) {
		return res.status(401).json({
			status: res.statusCode,
			error: "Unauthorized!",
			message: "Please enter a vaild token!",
		});
	}

	try {
		const verifyToken = jwt.verify(fetchAuthToken, JWT_SECRET);
		req.user = verifyToken.user;
		next();
	} catch (error) {
		res.status(401).json({
			status: res.statusCode,
			error: "Unauthorized!",
			message: "Please enter a vaild token!",
		});
	}
};

module.exports = fetchUser;
