import axios from "axios";
import xml2js from "xml2js";

const getActivities = async (req, res) => {
    try {
        const response = await axios.get("https://www.ucdavis.edu/news/latest/rss");
 
        const parser = new xml2js.Parser();
        parser.parseString(response.data, (err, result) => {
            if (err) {
                res.status(500).json({ message: err.message });
            } else {
                const items = result.rss.channel[0].item;
                const transformedItems = items.map(item => {
                    const displayName = item["dc:creator"] ? item["dc:creator"][0] : 'Unknown';
                    const title = item.title ? item.title[0] : 'No title';
                    const content = item.description ? item.description[0] : 'No description';
                    const url = item.link ? item.link[0] : 'No link';

                    return {
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
                    };
                });
                res.status(200).send(transformedItems);
            }
        });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export default {
    getActivities
};