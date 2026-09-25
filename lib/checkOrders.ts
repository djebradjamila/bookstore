import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY || "",
  },
});

async function checkOrders() {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: "Orders",
      })
    );

    console.log("Orders found:", result.Items);
  } catch (error) {
    console.error("Error reading Orders table:", error);
  }
}

checkOrders();