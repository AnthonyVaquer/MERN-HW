const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const typeDefs = require('./schemas/typeDefs');
const resolvers = require('./schemas/resolvers');
const { authMiddleware } = require('./utils/auth');
const cors = require('cors')

const { ApolloServer } = require('apollo-server-express');


const app = express();
const PORT = process.env.PORT || 3010;

const server = new ApolloServer({
  typeDefs,
  resolvers,
 
  context: ({ req }) => {
    // Apply authentication middleware
    var userId = authMiddleware(req);

    // Pass the authenticated user ID to the resolvers
    return {
      userId,
    };
  },

});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// app.use(routes);

const startApolloServer = async () => {
  console.log('starting');
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  };
  startApolloServer();
  