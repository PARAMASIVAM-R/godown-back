const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userType: { type: String, required: true },
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  district: { type: String, required: true },
  extra: { type: String }, // For "Godown Incharge" (Godown Name) & "PDS Incharge" (PDS Name)
  godownName: { type: String }, // ✅ Separate field for PDS Incharge's Godown Name
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);

