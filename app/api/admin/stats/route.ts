import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "local",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
  },
});

export async function GET() {
  try {
    const [booksResult, usersResult, ordersResult] = await Promise.all([
      client.send(
        new ScanCommand({
          TableName: "Books",
          Select: "COUNT",
        })
      ),

      client.send(
        new ScanCommand({
          TableName: "Users",
          Select: "COUNT",
        })
      ),

      client.send(
        new ScanCommand({
          TableName: "Orders",
        })
      ),
    ]);

    const totalBooks = booksResult.Count || 0;
    const totalUsers = usersResult.Count || 0;
    const orders = ordersResult.Items || [];

    const totalOrders = orders.length;

    const revenue = orders.reduce((total, order) => {
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
        revenue,
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