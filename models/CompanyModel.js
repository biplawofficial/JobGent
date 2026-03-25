const mongoose = require("mongoose");

const CompaniesSchema = new mongoose.Schema({
    company_name: { type: String, required: true, unique: true },
    domain: { type: String },
    applied: { type: Boolean, default: false }
}, { timestamps: true });

const OpeningsSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Companies" },
    company_name: { type: String, required: true },
    role: { type: String, required: true },
    opening_url: { type: String, required: true },
    time_posted: { type: String } // not required always because current verion of this code can break
}, { timestamps: true });

const Companies = mongoose.model("Companies", CompaniesSchema);
const Openings = mongoose.model("Openings", OpeningsSchema);

module.exports = { Companies, Openings };