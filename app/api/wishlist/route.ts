import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

// GET - Get user's wishlist
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return Response.json(
        { error: "User email is required." },
        { status: 400 }
      );
    }

    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Wishlists",
        KeyConditionExpression: "userEmail = :userEmail",
        ExpressionAttributeValues: {
          ":userEmail": userEmail.trim().toLowerCase(),
        },
      })
    );

    return Response.json({
      success: true,
      wishlist: result.Items || [],
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return Response.json(
      { error: "Unable to load wishlist." },
      { status: 500 }
    );
  }
}

// POST - Add book to wishlist
export async function POST(request: Request) {
  try {
    const { userEmail, bookTitle } = await request.json();

    if (!userEmail || !bookTitle) {
      return Response.json(
        { error: "User email and book title are required." },
        { status: 400 }
      );
    }

    await dynamoDB.send(
      new PutCommand({
        TableName: "Wishlists",
        Item: {
          userEmail: userEmail.trim().toLowerCase(),
          bookTitle: bookTitle.trim(),
          createdAt: new Date().toISOString(),
        },
      })
    );

    return Response.json(
      {
        success: true,
        message: "Book added to wishlist.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add wishlist error:", error);

    return Response.json(
      { error: "Unable to add book to wishlist." },
      { status: 500 }
    );
  }
}

// DELETE - Remove book from wishlist
export async function DELETE(request: Request) {
  try {
    const { userEmail, bookTitle } = await request.json();

    if (!userEmail || !bookTitle) {
      return Response.json(
        { error: "User email and book title are required." },
        { status: 400 }
      );
    }

    await dynamoDB.send(
      new DeleteCommand({
        TableName: "Wishlists",
        Key: {
          userEmail: userEmail.trim().toLowerCase(),
          bookTitle: bookTitle.trim(),
        },
      })
    );

    return Response.json({
      success: true,
      message: "Book removed from wishlist.",
    });
  } catch (error) {
    console.error("Delete wishlist error:", error);

    return Response.json(
      { error: "Unable to remove book from wishlist." },
      { status: 500 }
    );
  }
}