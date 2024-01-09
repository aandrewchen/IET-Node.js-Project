import axios from "axios";
import xml2js from "xml2js";
import { v5 as uuidv5 } from "uuid";
import rssActivities from "../../model/rssActivities.js";
import { getChecksum, addAggieFeedProperties, orderActivities } from "./utils.js";

import dotenv from 'dotenv';
dotenv.config();

const namespace = process.env.NAMESPACE;
const AGGIEFEED_API_KEY = process.env.AGGIEFEED_API_KEY;

const getActivities = async (req, res) => {
    try {
        const response = await axios.get("https://www.ucdavis.edu/news/latest/rss");
 
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);
                
        const items = result.rss.channel.item;

        items.forEach(item => {
            const displayName = item["dc:creator"] ? item["dc:creator"] : 'Unknown';
            const title = item.title ? item.title : 'No title';
            const content = item.description ? item.description.replace(/<[^>]*>/g, '').replace(/\n/g, '') : 'No description';
            const ucdSrcId = item.link ? item.link : 'No link';
            const published = item.pubDate.time.$.datetime ? new Date(item.pubDate.time.$.datetime).toISOString() : 'No date';
            const id = uuidv5(ucdSrcId, namespace);

            const newRssActivity = new rssActivities({
                title: title,
                object: {
                    content: content,
                    ucdSrcId: ucdSrcId,
                    ucdEdusModel: {
                        url: ucdSrcId,
                        urlDisplayName: title,
                    },
                },
                actor: {
                    author: {
                        displayName: displayName,
                    },
                },
                published: published,
            });

            // Creating checksum of only RSS properties
            console.log("Creating checksum");
            const checksum = getChecksum(newRssActivity);
            console.log("Checksum created:", checksum);
            newRssActivity.checksum = checksum;
            
            console.log(newRssActivity);

            rssActivities.findOne({ id: id })
                .then(existingActivity => {
                    if (existingActivity && (existingActivity.checksum === checksum)) {
                        console.log("RSS Activity already exists in database and is up-to-date");
                        return;
                    } else {
                        addAggieFeedProperties(newRssActivity);

                        rssActivities.findOneAndUpdate(
                            { id: id },
                            newRssActivity,
                            { upsert: true, runValidators: true },
                        ).then(() => {
                            console.log("RSS Activity updated or saved to database");
                        }).catch(err => {
                            console.log("Error:", err);
                        });
                    }
                });  
        });

        res.status(200).send("All up-to-date RSS Activities saved to database");

    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

const getStoredActivities = async (req, res) => {
    try {
        const activities = await rssActivities.find().limit(20);
        
        const orderedActivities = orderActivities(activities);
        
        res.json(orderedActivities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSources = async (req, res) => {
    try {
        const response = await axios.get("http://localhost:8080/api/v1/source", {
            headers: {
                "Authorization": `ApiKey ${AGGIEFEED_API_KEY}`,
            },
            params: {
                "connectorType": "rss",
            },
        })
        const data = response.data
        res.send(data)
        console.log(data)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export default {
    getActivities,
    getStoredActivities,
    getSources
};