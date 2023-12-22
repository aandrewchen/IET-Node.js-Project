# IET-Node.js-Project

In this project, I used Express.js to build my REST API endpoints, Axios to make HTTP requests, and Docker to create a MongoDB image to persist the data.

When the browser points to http://localhost:8080/posts, each AggieFeed activities' id, published, title, and actor.displayName data properties are returned.

When the browser points to http://localhost:8080/rssData, RSS data is stored in a local MongoDB database in AggieFeed Activity Data Format.

When the browser points to http://localhost:8080/rssData/posts, the stored activities are sent.

# How To Run This App

1. Clone this repository
2. Ask Andrew for environment variables
2. Run these commands in your terminal:
   1. npm install
   2. npm start
3. Run 'docker-compose up' to run the container of the MongoDB image
4. Navigate to http://localhost:8080/rssData to store RSS data into the MongoDB database.
5. Navigate to http://localhost:8080/rssData/posts to see the activities.
