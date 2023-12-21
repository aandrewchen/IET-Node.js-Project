import axios from "axios";
import xml2js from "xml2js";
import rssActivities from "../../model/rssActivities.js";

const getActivities = async (req, res) => {
    try {
        const response = await axios.get("https://www.ucdavis.edu/news/latest/rss");
 
        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(response.data, (err, result) => {
            if (err) {
                res.status(500).json({ message: err.message });
            } else {
                const items = result.rss.channel.item;
                items.forEach(item => {
                    const displayName = item["dc:creator"] ? item["dc:creator"] : 'Unknown';
                    const title = item.title ? item.title : 'No title';
                    const content = item.description ? item.description.replace(/<[^>]*>/g, '').replace(/\n/g, '') : 'No description';
                    const url = item.link ? item.link : 'No link';

                    const newRssActivity = new rssActivities({
                        activity : {
                            actor : {
                                author : {
                                    displayName : displayName,
                                },
                            },
                            title : title,
                            object : {
                                content : content,
                                ucdEdusModel : {
                                    url : url,
                                }
                            }
                        }
                    });
                    
                    newRssActivity.save();
                    console.log("Activity saved to database");
                });
                res.status(200).send("RSS Activities saved to database");
            }
        });
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