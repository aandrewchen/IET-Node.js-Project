import crypto from "crypto";
import axios from "axios";

import dotenv from 'dotenv';
dotenv.config();

const AGGIEFEED_API_KEY = process.env.AGGIEFEED_API_KEY;

export function getChecksum(rssActivity) {
    const hash = crypto.createHash('sha256');
    const value = JSON.stringify(rssActivity);
    console.log("Stringified value:", value);
    hash.update(value);
    return hash.digest('hex');
}

export function addAggieFeedProperties(rssActivity, connectorId) {
    const startDate = new Date().toISOString();
    const actorId = "edustest";
    const actorDisplayName = "UC Test Department";
    const authorId = "test-source-id";
    const authorDisplayName = "UC Test Department";
    const icon = "icon-rss";

    rssActivity.object = {
        content: rssActivity.object.content,
        objectType: "notification",
        ucdSrcId: rssActivity.object.ucdSrcId,
        ucdEdusModel: {
            ...rssActivity.object.ucdEdusModel,
        },
    };

    rssActivity.ucdEdusMeta = {
        startDate: startDate,
        labels: ["~campus-life"],
        endDate: "2030-01-01T00:00:00.000Z",
    };

    rssActivity.actor = {
        ...rssActivity.actor,
        id: actorId,
        displayName: actorDisplayName,
        author: {
            id: authorId,
            displayName: authorDisplayName,
        },
        objectType: "organization",
    };

    rssActivity.icon = icon;
    rssActivity.priority = 0;
    rssActivity.score = 0;
    rssActivity.verb = "post";
    rssActivity.to = [
        {
            id: "public",
            g: true,
            i: false,
        }
    ];
    rssActivity.generator = {
        id: connectorId,
    };

    return {
        activity: rssActivity,
    };
}

export function orderActivities(activities) {
    return activities.map(activity => ({
        _id: activity._id,
        title: activity.title,
        object: activity.object,
        ucdEdusMeta: activity.ucdEdusMeta,
        verb: activity.verb,
        actor: activity.actor,
        icon: activity.icon,
        id: activity.id,
        priority: activity.priority,
        published: activity.published,
        score: activity.score,
    }));
}

export async function getSources() {
    try {
        const response = await axios.get("http://localhost:8080/api/v1/source", {
            headers: {
                "Authorization": `ApiKey ${AGGIEFEED_API_KEY}`,
            },
            params: {
                "connectorType": "rss",
            },
        });
        const data = response.data
        const rssURI = data[0].connectors[0].uri;
        const connectorId = data[0].connectors[0].id;
        return { rssURI, connectorId };
    } catch (err) {
        throw err;
    }
};

export async function updateActivities(rssActivity) {
    try {
        await axios.post('http://localhost:8080/api/v1/activity', rssActivity, {
            headers: {
                "Authorization": `ApiKey ${AGGIEFEED_API_KEY}`,
            },
        })
        .then(() => {
            console.log("Activity sent to AggieFeed API");
        })
    } catch (err) {
        if (err.response.data === 'ERROR: Duplicate activity') {
            console.log("Activity up-to-date");
        } else if (err.response.data === 'ERROR:  Existing activity but modified content') {
            putActivity(rssActivity);
        }
    }
}

function putActivity(rssActivity) {
    try {
        axios.put(`http://localhost:8080/api/v1/activity/${rssActivity.object.id}`, rssActivity, {
            headers: {
                "Authorization": `ApiKey ${AGGIEFEED_API_KEY}`,
            },
        })
        .then(() => {
            console.log("Modified activity sent to AggieFeed API");
        })
    } catch (err) {
        throw err;
    }
}