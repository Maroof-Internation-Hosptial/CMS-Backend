import { Event } from "../models/event.js";

export const createEvent = async (req, res) => {
  const { name, description,department } =
    req.body;
  if (
    !name ||
    !description ||
    !department 

  ) {
    return res.status(422).json({ error: "please fill all fields " });
  }
  try {
    const event_create = new Event({
      ...req.body,
      created_by: req.user?._id,
    });
    let event = await event_create.save();
    if (event) {
      res.status(200).json({ message: "event created successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const { _id } = req.params;

  try {
    await Event.findByIdAndUpdate({ _id }, req.body);
    res.status(200).json({ message: "updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "something went wrong!" });
  }
};

export const generateEvents = async (req, res) => {
  const { startDate, endDate, userId } = req.query;

  const filter = {
    is_active: true,
    date: {
      $gte: Number(startDate),
      $lte: Number(endDate) + 86400,
    },
  };
  if (userId) {
    filter.created_by = userId;
  }

  try {
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required." });
    }
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    const events = await Event.find(filter);
    res.json(events);
  } catch (error) {
    console.log(error);
  }
};

export const generateUserPDF = async (req, res) => {
  const { userId, startDate, endDate } = req.query;
  try {
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required." });
    }
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    const events = await Event.find({
      is_active: true,
      created_by: userId,
      date: {
        $gte: Number(startDate),
        $lte: Number(endDate) + 86400,
      },
    });
    res.json(events);
  } catch (error) {
    console.log(error);
  }
};

export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const userId = req.user._id;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating value" });
    }
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    event.ratings.push({ byUser: userId, rating });
    const response = await event.save();
    res.json({ message: "Rating added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
