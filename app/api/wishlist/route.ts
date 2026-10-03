import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamoDB } from "@/lib/dynamodb";

// =====================================================
// GET - Get wishlist for a user or visitor
// =====================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userEmail =
      searchParams.get("userEmail");

    if (!userEmail) {
      return Response.json(
        {
          success: false,
          error: "User email is required.",
        },
        { status: 400 }
      );
    }

    const normalizedUserEmail =
      userEmail.trim().toLowerCase();

    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Wishlists",

        KeyConditionExpression:
          "userEmail = :userEmail",

        ExpressionAttributeValues: {
          ":userEmail": normalizedUserEmail,
        },
      })
    );

    return Response.json({
      success: true,
      wishlist: result.Items || [],
    });
  } catch (error) {
    console.error(
      "Get wishlist error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Unable to load wishlist.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Add book to wishlist
// =====================================================

export async function POST(request: Request) {
  try {
    const {
      userEmail,
      bookTitle,
    } = await request.json();

    if (!userEmail || !bookTitle) {
      return Response.json(
        {
          success: false,
          error:
            "User email and book title are required.",
        },
        { status: 400 }
      );
    }

    const normalizedUserEmail =
      userEmail.trim().toLowerCase();

    const normalizedBookTitle =
      bookTitle.trim();

    if (!normalizedUserEmail) {
      return Response.json(
        {
          success: false,
          error: "Invalid user identifier.",
        },
        { status: 400 }
      );
    }

    if (!normalizedBookTitle) {
      return Response.json(
        {
          success: false,
          error: "Book title is required.",
        },
        { status: 400 }
      );
    }

    await dynamoDB.send(
      new PutCommand({
        TableName: "Wishlists",

        Item: {
          userEmail: normalizedUserEmail,

          bookTitle: normalizedBookTitle,

          createdAt:
            new Date().toISOString(),
        },
      })
    );

    return Response.json(
      {
        success: true,
        message:
          "Book added to wishlist.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Add wishlist error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Unable to add book to wishlist.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Remove book from wishlist
// =====================================================

export async function DELETE(
  request: Request
) {
  try {
    const {
      userEmail,
      bookTitle,
    } = await request.json();

    if (!userEmail || !bookTitle) {
      return Response.json(
        {
          success: false,
          error:
            "User email and book title are required.",
        },
        { status: 400 }
      );
    }

    const normalizedUserEmail =
      userEmail.trim().toLowerCase();

    const normalizedBookTitle =
      bookTitle.trim();

    await dynamoDB.send(
      new DeleteCommand({
        TableName: "Wishlists",

        Key: {
          userEmail:
            normalizedUserEmail,

          bookTitle:
            normalizedBookTitle,
        },
      })
    );

    return Response.json({
      success: true,
      message:
        "Book removed from wishlist.",
    });
  } catch (error) {
    console.error(
      "Delete wishlist error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Unable to remove book from wishlist.",
      },
      { status: 500 }
    );
  }
}