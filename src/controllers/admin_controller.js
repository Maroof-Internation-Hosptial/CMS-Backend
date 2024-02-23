import { Event } from "../models/event.js";
import { User } from "../models/user.js";
import randomColor from "randomcolor";

export const getSelectiveEvents = async (req, res) => {
	const { userdepartment } = req.user;
	try {
		const events = await Event.find({
			is_active: true,
			department: userdepartment,
		}).populate("created_by", "_id firstName lastName email image");
		const statusOrder = {
			success: 1,
			"in-progress": 2,
			upcoming: 3,
			canceled: 4,
		};
		const sortedEvents = events.sort(
			(a, b) => statusOrder[a.status] - statusOrder[b.status]
		);
		res.status(200).json(sortedEvents);
	} catch (error) {
		console.log(error);
		res.status(400).json({ error: error.message });
	}
};
export const getEvents = async (req, res) => {
	try {
		const events = await Event.find({ is_active: true }).populate(
			"created_by",
			"_id firstName lastName email image"
		);
		const statusOrder = {
			success: 1,
			"in-progress": 2,
			upcoming: 3,
			canceled: 4,
		};
		const sortedEvents = events.sort(
			(a, b) => statusOrder[a.status] - statusOrder[b.status]
		);
		res.status(200).json(sortedEvents);
	} catch (error) {
		console.log(error);
		res.status(400).json({ error: error.message });
	}
};

export const eventsForCalender = async (req, res) => {
	const { role } = req.user;
	const filter = {
		is_active: true,
	};
	if (role === "dept-manager") {
		filter.created_by = req.user._id;
	}
	if (role === "complaint-assignee") {
		filter.created_by = req.user.created_by;
	}
	try {
		const events = await Event.find({ is_active: true }).sort({
			createdAt: -1,
		});
		res.status(200).json(events);
	} catch (error) {
		console.log(error);
		res.status(400).json({ error: error.message });
	}
};

export const getMembers = async (req, res) => {
	try {
		const users = await User.find({
			role: { $ne: "admin" },
		}).sort({ createdAt: -1 });
		res.status(200).json(users);
	} catch (error) {
		console.log(error);
		res.status(400).json({ error: error.message });
	}
};

export const updateMember = async (req, res) => {
	const { _id } = req.params;

	try {
		const user = await User.findByIdAndUpdate({ _id }, req.body, { new: true });
		res.status(200).json({ message: "updated successfully", user });
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "something went wrong!" });
	}
};

export const GetStats = async (req, res) => {
	try {
		const userData = await User.aggregate([
			{
				$group: {
					_id: "$city",
					count: { $sum: 1 },
				},
			},
		]);

		const backgroundColor = userData.map(() => randomColor());

		const labels = userData.map((entry) => entry._id);
		const data = userData.map((entry) => entry.count);

		const chartData = {
			labels,
			datasets: [
				{
					data,
					backgroundColor,
				},
			],
		};

		res.json(chartData);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
