import Koa from "koa";
import Router from "@koa/router";
import cors from '@koa/cors';
import logger from "koa-logger";
import fs from "fs-extra";
import bodyParser from "koa-bodyparser";
import _ from 'lodash';
import * as R from 'ramda';

const app = new Koa();
const router = new Router();

app.use(logger());
app.use(cors());

function getLastFiveRequests(clickCounts1, clickCounts2) {
    // Extract the last requests from clickCounts1
    const requestsArray1 = [];
    for (const artwork in clickCounts1) {
        const timestamps = clickCounts1[artwork];
        const lastTimestamp = timestamps[timestamps.length - 1];
        requestsArray1.push({
            artwork: artwork,
            timestamp: lastTimestamp
        });
    }

    // Extract all requests from clickCounts2
    const requestsArray2 = [];
    for (const artwork in clickCounts2) {
        const timestamps = clickCounts2[artwork];
        for (let i = 0; i < timestamps.length; i++) {
            requestsArray2.push({
                artwork: artwork,
                timestamp: timestamps[i]
            });
        }
    }

    // Combine the last requests from clickCounts1 and all requests from clickCounts2
    const combinedRequests = [...requestsArray1, ...requestsArray2];

    // Sort the combined requests by timestamp
    const sortedRequests = combinedRequests.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    // Calculate the total number of requests
    const totalRequests = combinedRequests.length;

    // Map the sorted requests to include the correct numero de requete
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
        'GET <a href="http://localhost:3000/timestamps-louvres">/timestamps-louvres</a>',
        'GET <a href="http://localhost:3000/timestamps-guimet">/timestamps-guimet</a>',
        'GET <a href="http://localhost:3000/timestamps-total">/timestamps-total</a>',

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
        const lastRequestData1 = await fs.readJSON("data/clickCountsLouvres.json");
        const lastRequestData2 = await fs.readJSON("data/clickCountsGuimet.json");
        const lastFiveRequestsLouvres = getLastFiveRequests(lastRequestData1,lastRequestData2);
        console.log(lastFiveRequestsLouvres)

        ctx.body = lastFiveRequestsLouvres;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsLouvres.json" };
    }
});

router.get("/last-requests-guimet", async (ctx) => {
    try {
        const lastRequestData1 = await fs.readJSON("data/clickCountsGuimet.json");
        const lastRequestData2 = await fs.readJSON("data/clickCountsLouvres.json");
        const lastFiveRequestsGuimet = getLastFiveRequests(lastRequestData1,lastRequestData2);
        ctx.body = lastFiveRequestsGuimet;
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
        const lastFiveRequestsTotal = getLastFiveRequests(mergedData);
        ctx.body = lastFiveRequestsTotal;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsLouvres.json" };
    }
});
router.get("/timestamps-louvres", async (ctx) => {
    try {
        const imageLinksData = await fs.readJSON("data/clickCountsLouvres.json");

        const dataArray = Object.entries(imageLinksData);
        // Sort array by the number of timestamps
        dataArray.sort((a, b) => b[1].length - a[1].length);
        // Convert sorted array back to object
        const sortedData = Object.fromEntries(dataArray);
        ctx.body = sortedData;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsLouvres.json" };
    }
});
router.get("/timestamps-guimet", async (ctx) => {
    try {
        const imageLinksData = await fs.readJSON("data/clickCountsGuimet.json");
        const dataArray = Object.entries(imageLinksData);

        // Sort array by the number of timestamps
        dataArray.sort((a, b) => b[1].length - a[1].length);
        // Convert sorted array back to object
        const sortedData = Object.fromEntries(dataArray);
        ctx.body = sortedData;
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsGuimet.json" };
    }
});
router.get("/timestamps-total", async (ctx) => {
    try {
        const imageLinksData1 = await fs.readJSON("data/clickCountsLouvres.json");
        const imageLinksData2 = await fs.readJSON("data/clickCountsGuimet.json");
        const mergedData = _.merge(imageLinksData1, imageLinksData2);

        // Convert object to array of key-value pairs
        const dataArray = Object.entries(mergedData);

        // Sort array by the number of timestamps
        dataArray.sort((a, b) => b[1].length - a[1].length);
        // Convert sorted array back to object
        const sortedData = Object.fromEntries(dataArray);
        ctx.body = sortedData;

    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Failed to read clickCountsGuimet.json" };
    }
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
console.log("Server started on: http://localhost:3000");



//--------fonctions utilisant ramda et les données












// Fonction pour obtenir le nombre total de clics
async function getClickCounts(filePath) {
    try {
        // Lire les données du fichier JSON
        const clickCountsData = await fs.readJSON(filePath);

        // Utilisation de Ramda pour calculer la somme totale des clics
        const totalClicks = R.pipe(
            R.values, // Extrait les valeurs de l'objet (ici, les tableaux de timestamps)
            R.map(R.length), // Calcule la longueur de chaque tableau de timestamps
            R.sum // Fait la somme de toutes les longueurs
        )(clickCountsData);

        return totalClicks; // Retourne le total des clics
    } catch (error) {
        // Gestion des erreurs en cas de problème lors de la lecture du fichier
        console.error('Erreur lors de la lecture des données :', error);
        return 0; // Retourne 0 en cas d'erreur
    }
}

// Fonction pour déterminer le musée le plus populaire
async function determineMostPopularMuseum() {
    // Obtenir le nombre total de clics pour le Louvre
    const clicksLouvre = await getClickCounts('data/clickCountsLouvres.json');
    // Obtenir le nombre total de clics pour le Guimet
    const clicksGuimet = await getClickCounts('data/clickCountsGuimet.json');

    // Afficher le nombre de clics pour chaque musée
    console.log(`Le Louvre a un total de ${clicksLouvre} clics/vues sur l'ensemble de ses oeuvres.`);
    console.log(`Le Guimet a un total de ${clicksGuimet} clics/vues sur l'ensemble de ses oeuvres.`);

    // Comparaison des deux musées et retour d'une phrase explicative
    if (clicksLouvre > clicksGuimet) {
        return `Le Louvre est le musée le plus populaire avec ${clicksLouvre} clics, dépassant le Guimet qui a ${clicksGuimet} clics.`;
    } else if (clicksGuimet > clicksLouvre) {
        return `Le Guimet est le musée le plus populaire avec ${clicksGuimet} clics, dépassant le Louvre qui a ${clicksLouvre} clics.`;
    } else {
        return `Les deux musées sont également populaires avec ${clicksLouvre} clics chacun.`;
    }
}

// Fonction pour obtenir l'œuvre la plus vue
async function getMostViewedArtwork(filePath) {
    try {
        // Lire les données du fichier JSON
        const clickCountsData = await fs.readJSON(filePath);

        // Utilisation de Ramda pour trouver l'œuvre la plus vue
        const mostViewed = R.pipe(
            R.toPairs, // Convertit l'objet en paires [artwork, clicks]
            R.map(([artwork, clicks]) => ({ artwork, clicks: clicks.length })), // Transforme en objets avec { artwork, clicks }
            R.reduce(R.maxBy(R.prop('clicks')), { artwork: '', clicks: 0 }) // Trouve l'objet avec le plus grand nombre de clics
        )(clickCountsData);

        return mostViewed; // Retourne l'œuvre la plus vue
    } catch (error) {
        // Gestion des erreurs en cas de problème lors de la lecture du fichier
        console.error('Erreur lors de la lecture des données :', error);
        return null; // Retourne null en cas d'erreur
    }
}

// Fonction pour obtenir les N œuvres les plus vues
async function getTopNViewedArtworks(filePath, N) {
    try {
        // Lire les données du fichier JSON
        const clickCountsData = await fs.readJSON(filePath);

        // Utilisation de Ramda pour trier et sélectionner les N œuvres les plus vues
        const sortedArtworks = R.pipe(
            R.toPairs, // Convertit l'objet en paires [artwork, clicks]
            R.map(([artwork, clicks]) => ({ artwork, clicks: clicks.length })), // Transforme en objets avec { artwork, clicks }
            R.sortBy(R.prop('clicks')), // Trie par le nombre de clics (ascendant)
            R.reverse, // Inverse l'ordre pour obtenir un tri descendant
            R.take(N) // Sélectionne les N premiers éléments
        )(clickCountsData);

        return sortedArtworks; // Retourne les N œuvres les plus vues
    } catch (error) {
        // Gestion des erreurs en cas de problème lors de la lecture du fichier
        console.error('Erreur lors de la lecture des données :', error);
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

// Fonction pour obtenir la distribution des vues
async function getViewsDistribution(filePath) {
    try {
        // Lire les données du fichier JSON
        const clickCountsData = await fs.readJSON(filePath);

        // Fonction pour catégoriser le nombre de vues
        const categorizeViews = (views) => {
            if (views < 10) return 'faible'; // Moins de 10 vues est considéré comme "faible"
            if (views < 50) return 'moyenne'; // Entre 10 et 50 vues est considéré comme "moyenne"
            return 'élevée'; // Plus de 50 vues est considéré comme "élevée"
        };

        // Utilisation de Ramda pour regrouper les œuvres par catégorie
        const distribution = R.pipe(
            R.toPairs, // Convertit l'objet en paires [artwork, clicks]
            R.map(([artwork, clicks]) => ({ artwork, views: clicks.length })), // Transforme en objets avec { artwork, views }
            R.groupBy(item => categorizeViews(item.views)) // Regroupe par catégorie de vues
        )(clickCountsData);

        return distribution; // Retourne la distribution des vues
    } catch (error) {
        // Gestion des erreurs en cas de problème lors de la lecture du fichier
        console.error('Erreur lors de la lecture des données :', error);
        return {}; // Retourne un objet vide en cas d'erreur
    }
}

// Fonction principale
async function main() {
    // Obtenir et afficher le musée le plus populaire
    const mostPopularMuseum = await determineMostPopularMuseum();
    console.log(mostPopularMuseum);

    // Obtenir et afficher l'œuvre la plus vue au Louvre
    const mostViewedLouvre = await getMostViewedArtwork('data/clickCountsLouvres.json');
    // Obtenir et afficher l'œuvre la plus vue au Guimet
    const mostViewedGuimet = await getMostViewedArtwork('data/clickCountsGuimet.json');

    // Afficher l'œuvre la plus vue pour chaque musée
    console.log(`L'œuvre la plus vue au Louvre est '${mostViewedLouvre.artwork}' avec ${mostViewedLouvre.clicks} vues.`);
    console.log(`L'œuvre la plus vue au Guimet est '${mostViewedGuimet.artwork}' avec ${mostViewedGuimet.clicks} vues.`);

    // Obtenir et afficher le top 3 des œuvres les plus vues au Louvre
    const top3Louvre = await getTopNViewedArtworks('data/clickCountsLouvres.json', 3);
    console.log('Top 3 œuvres les plus vues au Louvre :', top3Louvre);

    // Obtenir et afficher la distribution des vues au Louvre
    const distributionLouvre = await getViewsDistribution('data/clickCountsLouvres.json');
    console.log('Distribution des vues au Louvre :', distributionLouvre);
}

// Appel de la fonction principale
main();