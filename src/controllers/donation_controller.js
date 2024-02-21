import { Donation } from "../models/donation.js";

export const createDonation = async (req, res) => {
  const { projectName, requiredCost, city, location } = req.body;

  try {
    if (!projectName || !requiredCost) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const donationEvent = new Donation({
      projectName,
      requiredCost,
      city,
      location,
    });
    await donationEvent.save();

    return res
      .status(201)
      .json({ message: "Donation event created successfully", donationEvent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllDonations = async (req, res) => {
  try {
    const donationEvents = await Donation.find()
      .populate("donors.donationBy", "firstName lastName image phone")
      .sort({ createdAt: -1 });
    return res.json(donationEvents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const Donate = async (req, res) => {
  const { donationBy, amount, receiptImage } = req.body;
  const donationId = req.params.donationId;

  try {
    if (!donationBy || !amount || !receiptImage) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const donationEvent = await Donation.findById(donationId);
    if (!donationEvent) {
      return res.status(404).json({ error: "Donation event not found" });
    }
    donationEvent.donors.push({
      donationBy,
      amount,
      receiptImage,
      donationDate: new Date().toISOString(),
    });
    await donationEvent.save();
    return res.status(201).json({
      message: "Donation received successfully",
      donation: donationEvent.donors,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const MarkDonate = async (req, res) => {
  const { donationId, donorId } = req.params;

  try {
    const donation = await Donation.findById(donationId);
    const donor = donation.donors.find((d) => d._id.toString() === donorId);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    donor.mark = true;
    await donation.save();
    res.json({ message: "Mark updated successfully", donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateDonation = async (req, res) => {
  const donationId = req.params.donationId;
  const {
    collectedAmount,
    projectName,
    estimatedCost,
    isActive,
    requiredCost,
    location,
    city,
  } = req.body;
  try {
    const donationEvent = await Donation.findById(donationId);

    if (!donationEvent) {
      return res.status(404).json({ error: "Donation not found" });
    }
    if (projectName) {
      donationEvent.projectName = projectName;
    }

    if (estimatedCost) {
      donationEvent.estimatedCost = estimatedCost;
    }

    if (collectedAmount) {
      donationEvent.collectedAmount = collectedAmount;
    }
    if (requiredCost) {
      donationEvent.requiredCost = requiredCost;
    }
    if (location) {
      donationEvent.location = location;
    }
    if (city) {
      donationEvent.city = city;
    }

    if (isActive) {
      donationEvent.is_active = false;
    }
    await donationEvent.save();
    return res.json({
      message: "Donation event updated successfully",
      donationEvent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteDonation = async (req, res) => {
  const { donationId } = req.params;
  try {
    await Donation.findByIdAndDelete(donationId);
    res.json({ message: "Dontation delete successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
