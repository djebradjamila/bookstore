
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY || "",
  },
});

const command = new CreateTableCommand({
  TableName: "Users",
  KeySchema: [
    {
      AttributeName: "email",
      KeyType: "HASH",
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: "email",
      AttributeType: "S",
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
});

async function createUsersTable() {
  try {
    const result = await client.send(command);
    console.log("Users table created successfully:", result.TableDescription);
  } catch (error) {
    console.error("Error creating Users table:", error);
  }
}

createUsersTable();