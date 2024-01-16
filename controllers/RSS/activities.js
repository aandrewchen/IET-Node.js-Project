import axios from "axios";
import xml2js from "xml2js";
// import rssActivities from "../../model/rssActivities.js";
import { getSources, addAggieFeedProperties, postActivities } from "./utils.js";

const getActivities = async (req, res) => {
    try {
        const sourceProperties = await getSources();
        
        const response = await axios.get(sourceProperties.rssURI);
 
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);
                
        const items = result.rss.channel.item;

        items.forEach(item => {
            const displayName = item["dc:creator"] ? item["dc:creator"] : 'Unknown';
            const title = item.title ? item.title.replace(/&#8216;/g, "'").replace(/&#8217;/g, "'") : 'No title'; // replace for " ' "
            const content = item.description ? item.description.replace(/<[^>]*>/g, '').replace(/\n/g, '') : 'No description'; // replace unwanted characters
            const ucdSrcId = item.link ? item.link : 'No link';
            const published = item.pubDate.time.$.datetime ? new Date(item.pubDate.time.$.datetime).toISOString() : 'No date';

            let newRssActivity = {
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
            };

            newRssActivity = addAggieFeedProperties(newRssActivity, sourceProperties.connectorId);

            console.log(newRssActivity);

            postActivities(newRssActivity);
        });

        res.status(200).send("All fetched RSS Activities saved to AggieFeed API");

    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

// const getStoredActivities = async (req, res) => {
//     try {
//         const activities = await rssActivities.find().limit(20);
        
//         const orderedActivities = orderActivities(activities);
        
//         res.json(orderedActivities);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

export default {
    getActivities,
    // getStoredActivities
};