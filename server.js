const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

const { runJob } = require("./controllers/updateController")
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

app.get('/api/v1/extract/company', async (req, res) => {
	try {
		const response = await runJob();
		console.log(response)
		res.send(response);
	} catch (e) {
		res.send(e)
	}

})
app.listen(PORT, () => {
	console.log(`Server running on port: ${PORT}`)
})


