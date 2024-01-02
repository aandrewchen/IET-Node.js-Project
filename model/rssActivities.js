import mongoose from "mongoose";
const { Schema, model } = mongoose;

const rssActivitiesSchema = new Schema({
    _id: String,
    title: String,
    object: {
        content: String,
        objectType: String,
        ucdSrcId: String,
        ucdEdusModel: {
            url: String,
            urlDisplayName: String,
        },
        id: String,
        masterId: String,
    },
    ucdEdusMeta: {
        startDate: String,
        labels: [String],
        endDate: String,
    },
    verb: String,
    actor: {
        id: String,
        displayName: String,
        author: {
            id: String,
            displayName: String,
        },
        objectType: String,
    },
    icon: String,
    id: String,
    priority: Number,
    published: String,
    score: Number,
    checksum: {
        type: String,
        required: true,
    },
});

const rssActivities = model("rssActivities", rssActivitiesSchema);
export default rssActivities;