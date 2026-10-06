const {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",

  // DynamoDB Local does not require real AWS credentials.
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

const TABLE_NAME = "Contacts";

async function main() {
  try {
    const result = await client.send(
      new ListTablesCommand({})
    );

    const tables = result.TableNames || [];

    console.log("Existing tables:");
    console.log(tables);

    if (tables.includes(TABLE_NAME)) {
      console.log(`\n✓ Table "${TABLE_NAME}" already exists.`);
      return;
    }

    console.log(`\nCreating table "${TABLE_NAME}"...`);

    await client.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,

        AttributeDefinitions: [
          {
            AttributeName: "id",
            AttributeType: "S",
          },
        ],

        KeySchema: [
          {
            AttributeName: "id",
            KeyType: "HASH",
          },
        ],

        BillingMode: "PAY_PER_REQUEST",
      })
    );

    console.log(`✓ Table "${TABLE_NAME}" created successfully.`);
  } catch (error) {
    console.error("\n✗ Error creating Contacts table:");
    console.error(error);
    process.exit(1);
  }
}

main();