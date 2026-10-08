import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  ScanCommand,
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

export async function GET() {
  try {
    const [
      booksResult,
      usersResult,
      ordersResult,
      wishlistResult,
    ] = await Promise.all([
      // =====================================================
      // BOOKS
      // =====================================================
      client.send(
        new ScanCommand({
          TableName: "Books",
        })
      ),

      // =====================================================
      // USERS
      // Only accounts with role = user
      // Administrator accounts are excluded.
      // =====================================================
      client.send(
        new ScanCommand({
          TableName: "Users",
          FilterExpression: "#role = :userRole",
          ExpressionAttributeNames: {
            "#role": "role",
          },
          ExpressionAttributeValues: {
            ":userRole": {
              S: "user",
            },
          },
          Select: "COUNT",
        })
      ),

      // =====================================================
      // ORDERS
      // =====================================================
      client.send(
        new ScanCommand({
          TableName: "Orders",
        })
      ),

      // =====================================================
      // WISHLIST
      // =====================================================
      client.send(
        new ScanCommand({
          TableName: "Wishlists",
          Select: "COUNT",
        })
      ),
    ]);

    const books = booksResult.Items || [];
    const orders = ordersResult.Items || [];

    // =====================================================
    // TOTAL STATISTICS
    // =====================================================

    const totalBooks = books.length;

    // Only role=user accounts are counted.
    // Admin accounts are excluded.
    const totalUsers = usersResult.Count || 0;

    const totalOrders = orders.length;

    const totalWishlist = wishlistResult.Count || 0;

    // =====================================================
    // LOW STOCK
    // Kept in the API for the stock alert section.
    // Low stock = between 1 and 5 units.
    // =====================================================

    const lowStock = books.filter((book) => {
      const stock = book.stock?.N
        ? Number(book.stock.N)
        : 0;

      return stock > 0 && stock <= 5;
    }).length;

    // =====================================================
    // OUT OF STOCK
    // This is now displayed as the dashboard card.
    // =====================================================

    const outOfStock = books.filter((book) => {
      const stock = book.stock?.N
        ? Number(book.stock.N)
        : 0;

      return stock === 0;
    }).length;

    // =====================================================
    // REVENUE
    // Only confirmed orders are counted.
    // =====================================================

    const revenue = orders
      .filter((order) => {
        const status = order.status?.S || "";

        return status.toLowerCase() === "confirmed";
      })
      .reduce((total, order) => {
        const totalValue = order.total?.N
          ? Number(order.total.N)
          : 0;

        return total + totalValue;
      }, 0);

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      stats: {
        totalBooks,
        totalUsers,
        totalOrders,
        totalWishlist,
        revenue,
        lowStock,
        outOfStock,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin statistics",
      },
      { status: 500 }
    );
  }
}