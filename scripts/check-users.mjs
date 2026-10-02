import {
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "local",
  endpoint:
    process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: {
    accessKeyId:
      process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY || "local",
  },
});

async function checkUsers() {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: "Users",
      })
    );

    const items = result.Items || [];

    console.log("\n================ USERS ================\n");

    console.log(`Total accounts: ${items.length}\n`);

    items.forEach((item, index) => {
      console.log(`--- Account ${index + 1} ---`);
      console.log("Email:", item.email?.S || "(missing)");
      console.log("First name:", item.firstName?.S || "(missing)");
      console.log("Last name:", item.lastName?.S || "(missing)");
      console.log("Role:", item.role?.S || "(NO ROLE)");
      console.log("Created:", item.createdAt?.S || "(missing)");
      console.log("");
    });

    console.log("=======================================\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

checkUsers();