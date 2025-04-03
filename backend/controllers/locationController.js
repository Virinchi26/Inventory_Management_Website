const db = require("../db");

// ✅ Add a new location
exports.addLocation = async (req, res) => {
  const { location_name } = req.body;

  try {
    if (!location_name) {
      return res.status(400).json({ message: "❌ Location name is required!" });
    }

    // 🔍 Check if location already exists
    const [existingLocation] = await db.query(
      "SELECT id FROM locations WHERE LOWER(location_name) = LOWER(?)",
      [location_name.trim()]
    );

    if (existingLocation.length > 0) {
      return res.status(400).json({ message: "❌ Location already exists!" });
    }

    // ✅ Insert new location
    await db.query("INSERT INTO locations (location_name) VALUES (?)", [
      location_name.trim(),
    ]);

    res.json({ message: "✅ Location added successfully!" });
  } catch (error) {
    console.error("❌ Error adding location:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all locations
exports.getLocations = async (req, res) => {
  try {
    const [locations] = await db.query(
      "SELECT * FROM locations ORDER BY location_name ASC"
    );
    res.json(locations);
  } catch (error) {
    console.error("❌ Error fetching locations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
