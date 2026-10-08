const {
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

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

const db = DynamoDBDocumentClient.from(client);

async function main() {
  const adminEmail = "admin@bookstore.local";

  console.log("");
  console.log("=================================");
  console.log("       DELETE OLD ADMIN");
  console.log("=================================");
  console.log("");

  await db.send(
    new DeleteCommand({
      TableName: "Users",
      Key: {
        email: adminEmail,
      },
    })
  );

  console.log(
    `Deleted administrator: ${adminEmail}`
  );

  console.log("");
  console.log(
    "The old administrator has been deleted."
  );

  console.log(
    "You can now create a new administrator."
  );

  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "Error deleting administrator:"
  );
  console.error(error);
  console.error("");

  process.exit(1);
});