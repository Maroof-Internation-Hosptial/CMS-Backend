export const uploadPicture = async (req, res) => {
  let imageUrls = req.file.path;
  if (imageUrls) {
    res
      .status(200)
      .json({ success: true, imageUrls, message: "uploaded successfully" });
  } else {
    res.status(400).json({ success: false, error: "something went wrong!" });
  }
};
export const uploadPictures = async (req, res) => {
  let imageUrls = req.files.map((file) => file.path);
  if (imageUrls.length > 0) {
    res
      .status(200)
      .json({ success: true, imageUrls, message: "uploaded successfully" });
  } else {
    res.status(400).json({ success: false, error: "something went wrong!" });
  }
};
