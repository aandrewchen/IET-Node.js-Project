const getActivities = async (req, res) => {
    try {
        const response = await fetch("https://aggiefeed.ucdavis.edu/api/v1/activity/public?s=0&l=10")
        const data = await response.json();
        const activities = data.map(activity => {
            return {
                id: activity.id,
                published: activity.published,
                title: activity.title,
                displayName: activity.actor.displayName
            };
        });
        res.status(200).json(activities);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export default {
    getActivities
}