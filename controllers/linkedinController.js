const { chromium } = require('playwright');
const { Companies, Openings } = require("../models/CompanyModel")

const extract_details = async (req, res) => {
    try {
        console.log('Starting LinkedIn Job Scraper...');
        const browserContext = await chromium.launchPersistentContext('./linkedin_user_data', {
            headless: false,
        });

        const page = browserContext.pages()[0] || await browserContext.newPage();

        await page.goto('https://www.linkedin.com/jobs/search?keywords=Software%20Developer&location=India&geoId=102713980&f_TPR=r86400', {
            waitUntil: 'domcontentloaded'
        });

        await page.waitForSelector('.job-search-card');

        const dismissBtn = page.locator('button[aria-label="Dismiss"]').first();
        if (await dismissBtn.isVisible()) {
            await dismissBtn.click();
        }

        const jobs = await page.locator('.job-search-card').all();
        let jobscount = 0
        for (const job of jobs) {
            if (jobscount > 50) break;
            try {
                const role = (await job.locator('h3').innerText()).trim();
                const url = await job.locator('a.base-card__full-link').getAttribute('href');
                const company = (await job.locator('h4 a').innerText()).trim();
                console.log(company)
                let time = await job.locator('.job-search-card__listdate--new').innerText().catch(() => '');
                if (!time) {
                    time = await job.locator('.job-search-card__listdate').innerText().catch(() => 'Unknown');
                }
                time = time.trim();

                console.log(time);
                console.log(url);
                jobscount++;

                const companyDoc = await Companies.findOneAndUpdate(
                    { company_name: company },
                    { $setOnInsert: { company_name: company } },
                    { upsert: true, returnDocument: 'after' }
                );
                const newOpening = new Openings({
                    company: companyDoc._id,
                    company_name: company,
                    role: role,
                    opening_url: url,
                    time_posted: time
                });
                await newOpening.save();
            } catch (err) {
                console.error("Skipped a job due to error: ", err.message);
            }
        }
        await browserContext.close();
        console.log("Updated")
        res.send("Names updated, check database for company names")
    } catch (e) {
        console.log(e)
        res.send(e)
    }
};

module.exports = { extract_details };