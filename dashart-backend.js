import Koa from "koa";
import Router from "@koa/router";
import cors from '@koa/cors';
import logger from "koa-logger";
import fs from "fs-extra";
import bodyParser from "koa-bodyparser";

const app = new Koa();
const router = new Router();

app.use(logger());
app.use(cors());

function getLastFiveRequests(clickCounts) {
    const requestsArray = [];
    for (const artwork in clickCounts) {
        const timestamps = clickCounts[artwork];
        for (let i = 0; i < timestamps.length; i++) {
            requestsArray.push({
                artwork: artwork,
                timestamp: timestamps[i]
            });
        }
    }

    const sortedRequests = requestsArray.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    const totalRequests = requestsArray.length;
    const lastFiveWithNumbers = sortedRequests.map((request, index) => ({
        "numero de requete": totalRequests - index,
        "oeuvres": request.artwork,
        "Date": new Date(request.timestamp).toLocaleString()
    }));

    return lastFiveWithNumbers;
}
router.get("/", (ctx) => {
    ctx.type = "html";
    ctx.body = [
        "Usable routes :",
        "",
        'GET <a href="http://localhost:3000/image-links">/image-links</a>',
        'POST <a href="http://localhost:3000/increment-counter">/save-click</a>',
        'GET <a href="http://localhost:3000/click-counter">/click-counter</a>',
        'GET <a href="http://localhost:3000/last-requests">/last-requests</a>',

    ].join("<br>");
});

router.get("/image-links", async (ctx) => {
    try {
        const imageLinksData = await fs.readJSON("datasets/ImageLinksLouvres.json");
        ctx.body = imageLinksData;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read ImageLinksLouvres.json" };
    }
});

router.post("/save-click", async (ctx) => {
    try {
        console.log(ctx.request.body);
        const { nom, timestamp } = ctx.request.body;


        // Read existing data from JSON file
        let jsonData = await fs.readFile("data/clickCounts.json");
        let clickCounts = JSON.parse(jsonData);

        // Check if nom exists in clickCounts
        if (!clickCounts.hasOwnProperty(nom)) {
            clickCounts[nom] = []; // Create an empty array if nom doesn't exist
        }

        // Add timestamp to the list associated with nom
        clickCounts[nom].push(timestamp);

        // Write updated data back to JSON file
        await fs.writeFile("data/clickCounts.json", JSON.stringify(clickCounts));

        ctx.body = { status: "success", message: "Click data saved successfully" };
    } catch (error) {
        console.error("Error saving click data:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to save click data" };
    }
});

router.get("/click-counter", async (ctx) => {
    try {
        const clickCountsData = await fs.readJSON("data/clickCounts.json");
        let sortedList = [];
        for (const oeuvres in clickCountsData) {
            // Calculate the number of views (length of timestamps array)
            const nombresdevue = clickCountsData[oeuvres].length;

            // Push an object containing art name and number of views to the sorted list
            sortedList.push({ oeuvres, nombresdevue });
        }

        // Sort the list based on the number of views in descending order
        sortedList.sort((a, b) => b.nombresdevue - a.nombresdevue);

        ctx.body = sortedList;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCounts.json" };
    }
});

router.get("/last-requests", async (ctx) => {
    try {
        const lastRequestData = await fs.readJSON("data/clickCounts.json");
        const lastFiveRequests = getLastFiveRequests(lastRequestData);
        ctx.body = lastFiveRequests;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCounts.json" };
    }
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
console.log("Server started on: http://localhost:3000");
