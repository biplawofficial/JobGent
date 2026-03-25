const { chromium } = require('playwright');
const { Companies, Openings } = require("../models/CompanyModel")

function parseLinkedInTime(timeStr) {
    if (!timeStr) return new Date();
    const now = Date.now();
    const str = timeStr.toLowerCase();
    
    let multiplier = 0;
    if (str.includes('minute') || str.includes('min')) multiplier = 60 * 1000;
    else if (str.includes('hour') || str.includes('hr')) multiplier = 60 * 60 * 1000;
    else if (str.includes('day')) multiplier = 24 * 60 * 60 * 1000;
    else if (str.includes('week')) multiplier = 7 * 24 * 60 * 60 * 1000;
    else if (str.includes('month')) multiplier = 30 * 24 * 60 * 60 * 1000;
    else if (str.includes('year')) multiplier = 365 * 24 * 60 * 60 * 1000;
    
    const match = str.match(/\d+/);
    if (match && multiplier) {
        const val = parseInt(match[0], 10);
        return new Date(now - val * multiplier);
    }
    return new Date(); // fallback
}

const extract_details = async () => {
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
        let jobscount = 0;
        const newOpenings = [];
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
                
                const timePostedTimestamp = parseLinkedInTime(time);
                
                jobscount++;

                const companyDoc = await Companies.findOneAndUpdate(
                    { company_name: company },
                    { $setOnInsert: { company_name: company } },
                    { upsert: true, returnDocument: 'after' }
                );

                const existingOpening = await Openings.findOne({
                    company_name: company,
                    role: role
                });

                if (!existingOpening) {
                    const newOpening = new Openings({
                        company: companyDoc._id,
                        company_name: company,
                        role: role,
                        opening_url: url,
                        time_posted: timePostedTimestamp
                    });
                    await newOpening.save();
                    
                    newOpenings.push({
                        company_name: company,
                        role: role,
                        opening_url: url,
                        time_posted: timePostedTimestamp
                    });
                }
            } catch (err) {
                console.error("Skipped a job due to error: ", err.message);
            }
        }
        await browserContext.close();
        console.log("Updated")
        return {
            message: "Names updated, check database for company names",
            new_openings: newOpenings
        };
    } catch (e) {
        console.log(e)
        return e
    }
};

module.exports = { extract_details };