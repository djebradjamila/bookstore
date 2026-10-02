import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  ScanCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";

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

const USERS_TABLE = "Users";
const ORDERS_TABLE = "Orders";

// GET - Get customer users only
export async function GET() {
  try {
    // Get all users
    const usersResult = await client.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      })
    );

    // Get all orders
    const ordersResult = await client.send(
      new ScanCommand({
        TableName: ORDERS_TABLE,
      })
    );

    const orders = ordersResult.Items || [];

    // Only keep regular customer accounts.
    // Admin accounts are stored in the same Users table
    // but must not appear in the customer Users page.
    const customerItems = (usersResult.Items || []).filter(
      (item) => item.role?.S === "user"
    );

    const users = customerItems.map((item) => {
      const email = item.email?.S || "";

      // Get all orders belonging to this user
      const userOrders = orders.filter(
        (order) =>
          order.userEmail?.S?.trim().toLowerCase() ===
          email.trim().toLowerCase()
      );

      // Sort orders from newest to oldest
      const sortedOrders = [...userOrders].sort((a, b) => {
        const dateA = a.createdAt?.S
          ? new Date(a.createdAt.S).getTime()
          : 0;

        const dateB = b.createdAt?.S
          ? new Date(b.createdAt.S).getTime()
          : 0;

        return dateB - dateA;
      });

      // Get the latest order
      const latestOrder = sortedOrders[0];

      // Phone
      const phone =
        latestOrder?.phone?.S ||
        item.phone?.S ||
        "";

      // Full address
      const addressParts = [
        latestOrder?.address?.S,
        latestOrder?.city?.S,
        latestOrder?.region?.S,
        latestOrder?.country?.S,
      ].filter(Boolean);

      const address = addressParts.join(", ");

      return {
        email,
        firstName: item.firstName?.S || "",
        lastName: item.lastName?.S || "",
        name: item.name?.S || "",
        phone,
        address,
        createdAt: item.createdAt?.S || "",
        orderCount: userOrders.length,
      };
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load users.",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    // Check that the account is a regular user.
    // This prevents the Admin Users page from deleting
    // an administrator account.
    const usersResult = await client.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      })
    );

    const user = (usersResult.Items || []).find(
      (item) =>
        item.email?.S?.trim().toLowerCase() ===
        String(email).trim().toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    if (user.role?.S !== "user") {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator accounts cannot be deleted from this page.",
        },
        { status: 403 }
      );
    }

    await client.send(
      new DeleteItemCommand({
        TableName: USERS_TABLE,
        Key: {
          email: {
            S: email,
          },
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user.",
      },
      { status: 500 }
    );
  }
}