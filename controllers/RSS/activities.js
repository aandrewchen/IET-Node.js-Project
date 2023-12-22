import axios from "axios";
import xml2js from "xml2js";
import crypto from "crypto";
import { v5 as uuidv5 } from "uuid";
import rssActivities from "../../model/rssActivities.js";

import dotenv from 'dotenv';
dotenv.config();

const namespace = process.env.NAMESPACE;

function getChecksum(rssActivity) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(rssActivity));
    return hash.digest('hex');
}

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
                    objectType: "notification",
                    ucdSrcId: ucdSrcId,
                    ucdEdusModel: {
                        url: ucdSrcId,
                        urlDisplayName: title,
                    },
                    id: "NOT SURE YET",
                    masterId: "NOT SURE YET",
                },
                ucdEdusMeta: {
                    startDate: new Date().toISOString(),
                    labels: ["~campus-life"],
                    endDate: "2030-01-01T00:00:00.000Z",
                },
                verb: "post",
                actor: {
                    id: "sourceId",
                    displayName: "NOT SURE YET",
                    author: {
                        id: "NOT SURE YET",
                        displayName: displayName,
                    },
                    objectType: "organization",
                },
                icon: "NOT SURE YET",
                id: id,
                priority: 0,
                published: published,
                score: 0,
            });

            const checksum = getChecksum(newRssActivity);
            newRssActivity.checksum = checksum;

            rssActivities.findOne({ id: newRssActivity.id })
                .then(existingActivity => {
                    if (existingActivity && existingActivity.checksum === checksum) {
                        console.log("RSS Activity already exists in database and is up-to-date");
                        return;
                    } else {
                        rssActivities.findOneAndUpdate(
                            { id: newRssActivity.id },
                            newRssActivity,
                            { upsert: true, runValidators: true },
                        ).then(() => {
                            console.log("RSS Activity saved to database");
                        }).catch(err => {
                            console.log(err);
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
        const activities = await rssActivities.find();
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export default {
    getActivities,
    getStoredActivities
};