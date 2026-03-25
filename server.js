const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

const { extract_details } = require("./controllers/linkedinController")
const { Company } = require("./models/CompanyModel")

dotenv.config()

const app = express()
const PORT = 8090
express.json()

//Health check
app.get('/health', (req, res) => {
	res.send("Health condition excellent");
})

//Mongo Connect
mongoose.connect("mongodb+srv://sage:sage@cluster0.vmi9jvv.mongodb.net/?appName=Cluster0").then(() => {
	console.log("MongoDB Connected")
}).catch((e) => {
	console.log(`Error encountered ${e}`)
})

app.get('/api/v1/extract/company', extract_details)
app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`)
})


