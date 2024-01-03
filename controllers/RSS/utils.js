import crypto from "crypto";

export function getChecksum(rssActivity) {
    const hash = crypto.createHash('sha256');
    const value = JSON.stringify(rssActivity);
    console.log("Stringified value:", value);
    hash.update(value);
    return hash.digest('hex');
}

export function addAggieFeedProperties(rssActivity) {
    const objectId = "NOT SURE YET";
    const objectMasterId = "NOT SURE YET";
    const startDate = new Date().toISOString();
    const labels = ["~campus-life"];
    const actorId = "sourceId";
    const actorDisplayName = "NOT SURE YET";
    const authorId = "NOT SURE YET";
    const icon = "NOT SURE YET";

    rssActivity.object = {
        content: rssActivity.object.content,
        objectType: "notification",
        ucdSrcId: rssActivity.object.ucdSrcId,
        ucdEdusModel: {
            ...rssActivity.object.ucdEdusModel,
        },
        id: objectId,
        masterId: objectMasterId,
    };

    rssActivity.ucdEdusMeta = {
        startDate: startDate,
        labels: labels,
        endDate: "2030-01-01T00:00:00.000Z",
    };

    rssActivity.actor = {
        ...rssActivity.actor,
        id: actorId,
        displayName: actorDisplayName,
        author: {
            id: authorId,
            displayName: rssActivity.actor.displayName,
        },
        objectType: "organization",
    };

    rssActivity.icon = icon;
    rssActivity.priority = 0;
    rssActivity.score = 0;
    rssActivity.verb = "post";

    return rssActivity;
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