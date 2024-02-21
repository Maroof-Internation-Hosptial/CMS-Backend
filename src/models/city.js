import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  name: String,
  state_id: Number,
  state_code: String,
  state_name: String,
  country_id: Number,
  country_code: String,
  country_name: String,
  latitude: String,
  longitude: String,
  wikiDataId: String,
});

export const City = mongoose.model("city", citySchema);
