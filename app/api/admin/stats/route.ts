
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
      // Books
      client.send(
        new ScanCommand({
          TableName: "Books",
        })
      ),

      // Users
      client.send(
        new ScanCommand({
          TableName: "Users",
          Select: "COUNT",
        })
      ),

      // Orders
      client.send(
        new ScanCommand({
          TableName: "Orders",
        })
      ),

      // Wishlist
      client.send(
        new ScanCommand({
          TableName: "Wishlists",
          Select: "COUNT",
        })
      ),
    ]);

    const books = booksResult.Items || [];
    const orders = ordersResult.Items || [];

    // Total statistics
    const totalBooks = books.length;
    const totalUsers = usersResult.Count || 0;
    const totalOrders = orders.length;
    const totalWishlist = wishlistResult.Count || 0;

    // Count books with low stock.
    // Low stock means between 1 and 5 units.
    const lowStock = books.filter((book) => {
      const stock = book.stock?.N
        ? Number(book.stock.N)
        : 0;

      return stock > 0 && stock <= 5;
    }).length;

    // Count books with no stock.
    const outOfStock = books.filter((book) => {
      const stock = book.stock?.N
        ? Number(book.stock.N)
        : 0;

      return stock === 0;
    }).length;

    // Calculate revenue ONLY from confirmed orders.
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

