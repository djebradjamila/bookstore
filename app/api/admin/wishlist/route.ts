
import {
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

const ADMIN_EMAIL = "admin@bookstore.local";

// GET - Get wishlist entries, excluding the administrator
export async function GET() {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: "Wishlists",
      })
    );

    const wishlists = (result.Items || []).filter((item) => {
      const email = String(item.userEmail || "")
        .trim()
        .toLowerCase();

      return email !== ADMIN_EMAIL;
    });

    return Response.json({
      success: true,
      wishlists,
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
    const { userEmail, bookTitle } = await request.json();

    if (
      typeof userEmail !== "string" ||
      typeof bookTitle !== "string" ||
      !userEmail.trim() ||
      !bookTitle.trim()
    ) {
      return Response.json(
        {
          success: false,
          error: "User email and book title are required.",
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
    console.error("Admin wishlist DELETE error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to delete wishlist entry.",
      },
      { status: 500 }
    );
  }
}