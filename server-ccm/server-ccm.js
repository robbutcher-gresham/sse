const express = require("express");
const { createHandler } = require("graphql-sse");
const { GraphQLObjectType, GraphQLSchema, GraphQLString } = require("graphql");
const {
  getGraphQLParameters,
  processSubscription,
} = require("@graphql-sse/server");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const Timestamp = new GraphQLObjectType({
  name: "Timestamp",
  fields: {
    timestamp: { type: GraphQLString },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => "world",
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: "CommandListSubscription",
    fields: {
      heartbeat: {
        type: Timestamp,
        subscribe: async function* () {
          for (let i = 0; i < 100; i++) {
            yield { heartbeat: { timestamp: Date.now() } };
          }
        },
      },
    },
  }),
});

let i = 0;
app.post("/subscriptions-sse", async (req, res, next) => {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  const { operationName, query, variables } = getGraphQLParameters(request);
  if (!query) {
    return next();
  }
  const result = await processSubscription({
    operationName,
    query,
    variables,
    request: req,
    schema,
  });

  if (result.type === "EVENT_STREAM") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    });

    result.subscribe((data) => {
      res.write(`id: ${i++}\n`);
      res.write(`event: next\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    req.on("close", () => {
      result.unsubscribe();
    });
  }
});

app.listen(4000);
console.log("Listening to port 4000");
