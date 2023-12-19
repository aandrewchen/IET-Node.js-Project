import mongoose from "mongoose";
const { Schema, model } = mongoose;

const rssActivitiesSchema = new Schema({
    activity: {
        actor: {
            author: {
                displayName: String,
            },
        },
        title: String,
        object: {
            content: String,
            ucdEdusModel: {
                url: String,
            },
        },
    },
});

const rssActivities = model("rssActivities", rssActivitiesSchema);
export default rssActivities;