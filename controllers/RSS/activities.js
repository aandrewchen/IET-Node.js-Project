import axios from "axios";
import xml2js from "xml2js";
import { v5 as uuidv5 } from "uuid";
import rssActivities from "../../model/rssActivities.js";
import { getChecksum, addAggieFeedProperties, orderActivities, getSources } from "./utils.js";

import dotenv from 'dotenv';
dotenv.config();

const namespace = process.env.NAMESPACE;
const AGGIEFEED_API_KEY = process.env.AGGIEFEED_API_KEY;

const getActivities = async (req, res) => {
    try {
        const rssURI = await getSources();
        
        const response = await axios.get(rssURI);
 
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
                            console.log("RSS Activity saved to database");
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

const postActivities = async (req, res) => {
    try {
        const activities = await rssActivities.find();
        const orderedActivities = orderActivities(activities);
        console.log(orderedActivities);
        for (const activity of orderedActivities) {
            await axios.post('http://localhost:8080/api/v1/activity', activity, {
                headers: {
                    "Authorization": `ApiKey ${AGGIEFEED_API_KEY}`,
                },
            });
        }

        res.status(200).json({ message: 'All activities sent to AggieFeed API' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export default {
    getActivities,
    getStoredActivities,
    postActivities,
};