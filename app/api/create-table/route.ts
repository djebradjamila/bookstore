import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY || "local",
  },
});

export async function GET() {
  try {
    try {
      await client.send(
        new DescribeTableCommand({
          TableName: "Books",
        })
      );

      return NextResponse.json({
        success: true,
        message: "Books table already exists!",
      });
    } catch {
      // Table does not exist, so we create it.
    }

    const command = new CreateTableCommand({
      TableName: "Books",
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    });

    const result = await client.send(command);

    return NextResponse.json({
      success: true,
      message: "Books table created successfully!",
      tableName: result.TableDescription?.TableName,
    });
  } catch (error) {
    console.error("DynamoDB Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Books table",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}