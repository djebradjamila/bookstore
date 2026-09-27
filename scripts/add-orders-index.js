const {
  DynamoDBClient,
  UpdateTableCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

async function addIndex() {
  try {
    const command = new UpdateTableCommand({
      TableName: "Orders",

      AttributeDefinitions: [
        {
          AttributeName: "userEmail",
          AttributeType: "S",
        },
      ],

      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: "userEmail-index",

            KeySchema: [
              {
                AttributeName: "userEmail",
                KeyType: "HASH",
              },
            ],

            Projection: {
              ProjectionType: "ALL",
            },

            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        },
      ],
    });

    const result = await client.send(command);

    console.log("GSI created successfully!");
    console.log(result.TableDescription?.GlobalSecondaryIndexes);
  } catch (error) {
    console.error("Error:", error);
  }
}

addIndex();