import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
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

async function fixUserRoles() {
  try {
    // Get all accounts
    const result = await client.send(
      new ScanCommand({
        TableName: "Users",
      })
    );

    const users = result.Items || [];

    let updated = 0;

    for (const user of users) {
      const email = user.email?.S;

      if (!email) {
        continue;
      }

      // Do not modify accounts that already have a role
      if (user.role?.S) {
        console.log(
          `Skipped: ${email} (role: ${user.role.S})`
        );
        continue;
      }

      // Add role=user to accounts without a role
      await client.send(
        new UpdateItemCommand({
          TableName: "Users",
          Key: {
            email: {
              S: email,
            },
          },
          UpdateExpression: "SET #role = :role",
          ExpressionAttributeNames: {
            "#role": "role",
          },
          ExpressionAttributeValues: {
            ":role": {
              S: "user",
            },
          },
        })
      );

      console.log(`Updated: ${email} → role=user`);

      updated++;
    }

    console.log("\n================================");
    console.log(`Updated accounts: ${updated}`);
    console.log("================================\n");
  } catch (error) {
    console.error("Error:", error);
  }
}

fixUserRoles();