const express = require("express");
const NotesSchema = require("../models/NoteSchema");
const fetchUser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// ROUTE 1 => Fetch Notes: Endpoint - POST "/api/v1/notes/fetchuser" ::: Login Required!
router.get("/fetchnotes", fetchUser, async (req, res) => {
	try {
		let getUserID = req.user.id;
		let fetchNotesData = await NotesSchema.find({ user: req.user.id });
		res.send(fetchNotesData);
	} catch (error) {
		return res.status(500).json({
			status: res.statusCode,
			error: "Internal Server Error!",
			message: error.message,
		});
	}
});

// ROUTE 2 => Create Notes: Endpoint - POST "/api/v1/notes/createnotes" ::: Login Required!
router.post(
	"/createnotes",
	fetchUser,
	[
		body("title", "Enter a valid title!!!").isLength({ min: 3 }),
		body("description", "Enter a valid Description!!!").isLength({ min: 5 }),
	],
	async (req, res) => {
		// If error occurs then return Bad Request with error!!!
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		try {
			let getUserID = req.user.id;

			let { title, description, tag } = req.body;

			// creating new note - NotesSchema
			newNote = await NotesSchema.create({
				user: getUserID,
				title,
				description,
				tag,
			});

			res.json({
				status: res.statusCode,
				userId: getUserID,
				message: "New Note Added!",
				note: newNote,
			});
		} catch (error) {
			return res.status(500).json({
				status: res.statusCode,
				error: "Internal Server Error!",
				message: error.message,
			});
		}
	}
);

// ROUTE 3 => Update Notes: Endpoint - PUT "/api/v1/notes/updatenote" ::: Login Required!
router.put(
	"/updatenote/:id",
	fetchUser,
	[
		body("title", "Enter a valid title!!!").isLength({ min: 3 }),
		body("description", "Enter a valid Description!!!").isLength({ min: 5 }),
	],
	async (req, res) => {
		// If error occurs then return Bad Request with error!!!
		let errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		try {
			let { title, description, tag } = req.body;

			const newNote = {};
			if (title) {
				newNote.title = title;
			}
			if (description) {
				newNote.description = description;
			}
			if (tag) {
				newNote.tag = tag;
			}

			let existingNote = await NotesSchema.findById(req.params.id);
			if (!existingNote) {
				return res.status(404).json({
					status: res.statusCode,
					error: "Not Found!",
					message: "Note not found, please type the correct id!",
				});
			}

			if (req.user.id !== existingNote.user.toString()) {
				return res.status(401).json({
					status: res.statusCode,
					error: "Unauthorized!",
					message: "Not allowed to update this note!",
				});
			}

			existingNote = await NotesSchema.findByIdAndUpdate(
				req.params.id,
				{ $set: newNote },
				{ new: true }
			);

			res.json({
				status: res.statusCode,
				userId: req.user.id,
				message: "New Note Added!",
				Note: existingNote,
			});
		} catch (error) {
			return res.status(500).json({
				status: res.statusCode,
				error: "Internal Server Error!",
				message: error.message,
			});
		}
	}
);

// ROUTE 4 => Delete Note: Endpoint - DELETE "/api/v1/notes/deletenote" ::: Login Required!
router.delete(
	"/deletenote/:id",
	fetchUser,
	async (req, res) => {
		try {
			let existingNote = await NotesSchema.findById(req.params.id);
			if (!existingNote) {
				return res.status(404).json({
					status: res.statusCode,
					error: "Not Found!",
					message: "Note not found, please type the correct id!",
				});
			}

			if (req.user.id !== existingNote.user.toString()) {
				return res.status(401).json({
					status: res.statusCode,
					error: "Unauthorized!",
					message: "Not allowed to delete this note!",
				});
			}

			existingNote = await NotesSchema.findByIdAndDelete(req.params.id);

			res.json({
				status: res.statusCode,
				userId: req.user.id,
				message: "Note deleted successfully!",
				Note: existingNote,
			});
		} catch (error) {
			return res.status(500).json({
				status: res.statusCode,
				error: "Internal Server Error!",
				message: error.message,
			});
		}
	}
);

module.exports = router;
