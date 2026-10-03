
import {
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

// GET - Get all wishlist entries
export async function GET() {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: "Wishlists",
      })
    );

    return Response.json({
      success: true,
      wishlists: result.Items || [],
    });
  } catch (error) {
    console.error("Admin wishlist GET error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to load wishlist data.",
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove a wishlist entry
export async function DELETE(request: Request) {
  try {
    const { userEmail, bookTitle } =
      await request.json();

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
      message: "Wishlist entry deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin wishlist DELETE error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Unable to delete wishlist entry.",
      },
      { status: 500 }
    );
  }
}

