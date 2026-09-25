import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  ListTablesCommand,
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
    const command = new ListTablesCommand({});
    const result = await client.send(command);

    return NextResponse.json({
      success: true,
      message: "DynamoDB Local connection successful!",
      tables: result.TableNames || [],
    });
  } catch (error) {
    console.error("DynamoDB Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "DynamoDB Local connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}