const cron = require("node-cron")
const nodemailer = require("nodemailer")
const { extract_details } = require("./linkedinController")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "udaydebnath999999@gmail.com",
        pass: "wmxp mmtp avxd vzuh"
    }
});

function generateJobEmail(response) {

    function formatTime(date) {
        const d = new Date(date);

        return d.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    const jobs = response.new_openings || [];
    
    // Sort jobs so that the most recent ones come first
    jobs.sort((a, b) => new Date(b.time_posted) - new Date(a.time_posted));

    const jobCards = jobs.map(job => `
        <div style="
            border:1px solid #e5e7eb;
            border-radius:12px;
            padding:16px;
            margin-bottom:16px;
            font-family: Arial, sans-serif;
            background:#ffffff;
            box-shadow:0 4px 10px rgba(0,0,0,0.05);
        ">
            <h2 style="margin:0;color:#111827;font-size:18px;">
                ${job.role}
            </h2>

            <p style="margin:6px 0;color:#6b7280;font-size:14px;">
                ${job.company_name}
            </p>

            <p style="margin:6px 0;color:#9ca3af;font-size:12px;">
                ⏱ Posted: ${formatTime(job.time_posted)}
            </p>

            <a href="${job.opening_url}" target="_blank"
                style="
                    display:inline-block;
                    margin-top:10px;
                    padding:10px 16px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    border-radius:8px;
                    font-size:14px;
                    font-weight:600;
                ">
                Apply Now
            </a>
        </div>
    `).join("");

    return `
    <div style="background:#f9fafb;padding:20px;">
        <h1 style="
            font-family:Arial;
            color:#111827;
            text-align:center;
        ">
            Openings
        </h1>

        <div style="max-width:600px;margin:0 auto;">
            ${jobCards}
        </div>
    </div>
    `;
}

const runJob = async () => {
    const response = await extract_details();
    const html = await generateJobEmail(response);

    await transporter.sendMail({
        from: "udaydebnath999999@gmail.com",
        to: "biplawofficial@gmail.com",
        subject: "New Job Openings",
        html: html
    });
    console.log("Mail sent");
    return response;
}

cron.schedule("*/10 * * * *", () => {
    runJob();
});

module.exports = { runJob };
