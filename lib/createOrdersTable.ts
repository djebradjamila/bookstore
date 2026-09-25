
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import {
  CreateTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY || "",
  },
});

async function createOrdersTable() {
  try {
    const command = new CreateTableCommand({
      TableName: "Orders",

      AttributeDefinitions: [
        {
          AttributeName: "orderId",
          AttributeType: "S",
        },
      ],

      KeySchema: [
        {
          AttributeName: "orderId",
          KeyType: "HASH",
        },
      ],

      BillingMode: "PAY_PER_REQUEST",
    });

    const result = await client.send(command);

    console.log("Orders table created successfully:", result.TableDescription);
  } catch (error) {
    console.error("Error creating Orders table:", error);
  }
}

createOrdersTable();