import axios from "axios";

const getActivities = async (req, res) => {
    try {
        const response = await axios.get("https://www.ucdavis.edu/news/latest/rss", {
            headers: {
                "Content-Type": "application/xml",
            }
        });
        res.send(response.data);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export default {
    getActivities
};