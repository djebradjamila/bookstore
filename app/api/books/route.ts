import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY || "local",
  },
});

// GET - Get all books
export async function GET() {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: "Books",
      })
    );

    return NextResponse.json({
      success: true,
      books: result.Items || [],
    });
  } catch (error) {
    console.error("DynamoDB Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch books",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Add a book
export async function POST(request: Request) {
  try {
    const book = await request.json();

    if (!book.id || !book.title || !book.author || !book.price) {
      return NextResponse.json(
        {
          success: false,
          message: "id, title, author and price are required",
        },
        { status: 400 }
      );
    }

    await client.send(
      new PutItemCommand({
        TableName: "Books",
        Item: {
          id: { S: String(book.id) },
          title: { S: String(book.title) },
          author: { S: String(book.author) },
          price: { N: String(book.price) },
          category: { S: String(book.category || "") },
          image: { S: String(book.image || "") },
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "Book added successfully!",
      book,
    });
  } catch (error) {
    console.error("DynamoDB Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add book",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}