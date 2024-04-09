import Koa from "koa";
import Router from "@koa/router";
import cors from '@koa/cors';
import logger from "koa-logger";
import fs from "fs-extra";
import bodyParser from "koa-bodyparser";
import _ from 'lodash';

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
        'GET <a href="http://localhost:3000/image-links-louvres">/image-links-louvres</a>',
        'GET <a href="http://localhost:3000/image-links-guimet">/image-links-guimet</a>',
        'POST <a href="http://localhost:3000/increment-counter-louvres">/save-click-louvres</a>',
        'POST <a href="http://localhost:3000/increment-counter-guimet">/save-click-guimet</a>',
        'GET <a href="http://localhost:3000/click-counter-louvres">/click-counter-louvres</a>',
        'GET <a href="http://localhost:3000/click-counter-guimet">/click-counter-guimet</a>',
        'GET <a href="http://localhost:3000/click-counter-total">/click-counter-total</a>',
        'GET <a href="http://localhost:3000/last-requests-louvres">/last-requests-louvres</a>',
        'GET <a href="http://localhost:3000/last-requests-guimet">/last-requests-guimet</a>',
        'GET <a href="http://localhost:3000/last-requests-total">/last-requests-total</a>',

    ].join("<br>");
});

router.get("/image-links-louvres", async (ctx) => {
    try {
        const imageLinksData = await fs.readJSON("datasets/ImageLinksLouvres.json");
        ctx.body = imageLinksData;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read ImageLinksLouvres.json" };
    }
});
router.get("/image-links-guimet", async (ctx) => {
    try {
        const imageLinksData = await fs.readJSON("datasets/ImageLinksGuimet.json");
        ctx.body = imageLinksData;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read ImageLinksGuimet.json" };
    }
});

router.post("/save-click-louvres", async (ctx) => {
    try {
        console.log(ctx.request.body);
        const { nom, timestamp } = ctx.request.body;


        // Read existing data from JSON file
        let jsonData = await fs.readFile("data/clickCountsLouvres.json");
        let clickCounts = JSON.parse(jsonData);

        // Check if nom exists in clickCounts
        if (!clickCounts.hasOwnProperty(nom)) {
            clickCounts[nom] = []; // Create an empty array if nom doesn't exist
        }

        // Add timestamp to the list associated with nom
        clickCounts[nom].push(timestamp);

        // Write updated data back to JSON file
        await fs.writeFile("data/clickCountsLouvres.json", JSON.stringify(clickCounts));

        ctx.body = { status: "success", message: "Click data saved successfully" };
    } catch (error) {
        console.error("Error saving click data:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to save click data" };
    }
});

router.post("/save-click-guimet", async (ctx) => {
    try {
        console.log(ctx.request.body);
        const { nom, timestamp } = ctx.request.body;


        // Read existing data from JSON file
        let jsonData = await fs.readFile("data/clickCountsGuimet.json");
        let clickCounts = JSON.parse(jsonData);

        // Check if nom exists in clickCounts
        if (!clickCounts.hasOwnProperty(nom)) {
            clickCounts[nom] = []; // Create an empty array if nom doesn't exist
        }

        // Add timestamp to the list associated with nom
        clickCounts[nom].push(timestamp);

        // Write updated data back to JSON file
        await fs.writeFile("data/clickCountsGuimet.json", JSON.stringify(clickCounts));

        ctx.body = { status: "success", message: "Click data saved successfully" };
    } catch (error) {
        console.error("Error saving click data:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to save click data" };
    }
});

router.get("/click-counter-louvres", async (ctx) => {
    try {
        const clickCountsData = await fs.readJSON("data/clickCountsLouvres.json");
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
        ctx.body = { error: "Failed to read clickCountsLouvres.json" };
    }
});
router.get("/click-counter-guimet", async (ctx) => {
    try {
        const clickCountsData = await fs.readJSON("data/clickCountsGuimet.json");
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
        ctx.body = { error: "Failed to read clickCountsGuimet.json" };
    }
});

router.get("/click-counter-total", async (ctx) => {
    try {
        const clickCountsData1 = await fs.readJSON("data/clickCountsGuimet.json");
        const clickCountsData2 = await fs.readJSON("data/clickCountsLouvres.json");
        const mergedData = _.merge(clickCountsData1, clickCountsData2);
        let sortedList = [];
        for (const oeuvres in mergedData) {
            // Calculate the number of views (length of timestamps array)
            const nombresdevue = mergedData[oeuvres].length;

            // Push an object containing art name and number of views to the sorted list
            sortedList.push({ oeuvres, nombresdevue });
        }

        // Sort the list based on the number of views in descending order
        sortedList.sort((a, b) => b.nombresdevue - a.nombresdevue);

        ctx.body = sortedList;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsGuimet.json" };
    }
});

router.get("/last-requests-louvres", async (ctx) => {
    try {
        const lastRequestData = await fs.readJSON("data/clickCountsLouvres.json");
        const lastFiveRequests = getLastFiveRequests(lastRequestData);
        ctx.body = lastFiveRequests;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsLouvres.json" };
    }
});

router.get("/last-requests-guimet", async (ctx) => {
    try {
        const lastRequestData = await fs.readJSON("data/clickCountsGuimet.json");
        const lastFiveRequests = getLastFiveRequests(lastRequestData);
        ctx.body = lastFiveRequests;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsGuimet.json" };
    }
});
router.get("/last-requests-total", async (ctx) => {
    try {
        const lastRequestData1 = await fs.readJSON("data/clickCountsLouvres.json");
        const lastRequestData2 = await fs.readJSON("data/clickCountsGuimet.json");
        const mergedData = _.merge(lastRequestData1, lastRequestData2);
        console.log(mergedData);
        const lastFiveRequests = getLastFiveRequests(mergedData);
        console.log(mergedData);
        ctx.body = lastFiveRequests;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsLouvres.json" };
    }
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
console.log("Server started on: http://localhost:3000");
