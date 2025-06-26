const allowedTypes = [
  "award-honors",
  "interests",
  "languages",
  "volunteering",
  "extracurricular",
];

function validateExtraType(req, res, next) {
  if (!allowedTypes.includes(req.params.type)) {
    return res.status(400).json({ error: "Invalid type in route." });
  }
  next();
}

module.exports = validateExtraType;
