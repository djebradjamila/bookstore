
import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

// GET - Get orders for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return Response.json(
        {
          error: "User email is required.",
        },
        { status: 400 }
      );
    }

    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Orders",
        IndexName: "userEmail-index",
        KeyConditionExpression: "userEmail = :userEmail",
        ExpressionAttributeValues: {
          ":userEmail": userEmail.trim().toLowerCase(),
        },
      })
    );

    return Response.json({
      success: true,
      orders: result.Items || [],
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return Response.json(
      {
        error: "Unable to load orders.",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(request: Request) {
  try {
    const {
      userEmail,
      items,
      total,
      address,
    } = await request.json();

    // Validate order information
    if (
      !userEmail ||
      !items ||
      items.length === 0 ||
      total === undefined ||
      !address ||
      !address.trim()
    ) {
      return Response.json(
        {
          error:
            "User email, items, total and delivery address are required.",
        },
        { status: 400 }
      );
    }

    const orderId = `ORD-${Date.now()}`;

    const order = {
      orderId,
      userEmail: userEmail.trim().toLowerCase(),
      address: address.trim(),
      items,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: "Orders",
        Item: order,
      })
    );

    return Response.json(
      {
        message: "Order created successfully.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return Response.json(
      {
        error:
          "Something went wrong while creating the order.",
      },
      { status: 500 }
    );
  }
}

// PATCH - Confirm or cancel an order
export async function PATCH(request: Request) {
  try {
    const {
      orderId,
      userEmail,
      action,
    } = await request.json();

    // Validate request
    if (!orderId || !userEmail || !action) {
      return Response.json(
        {
          error:
            "Order ID, user email and action are required.",
        },
        { status: 400 }
      );
    }

    // Validate action
    if (action !== "confirm" && action !== "cancel") {
      return Response.json(
        {
          error: "Action must be confirm or cancel.",
        },
        { status: 400 }
      );
    }

    // Find the user's order
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: "Orders",
        IndexName: "userEmail-index",
        KeyConditionExpression: "userEmail = :userEmail",
        ExpressionAttributeValues: {
          ":userEmail": userEmail.trim().toLowerCase(),
        },
      })
    );

    const order = result.Items?.find(
      (item) => item.orderId === orderId
    );

    if (!order) {
      return Response.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // Only pending orders can be modified
    if (order.status !== "pending") {
      return Response.json(
        {
          error: "Only pending orders can be modified.",
        },
        { status: 400 }
      );
    }

    // CANCEL ORDER
    // The order is permanently deleted from DynamoDB.
    if (action === "cancel") {
      await dynamoDB.send(
        new DeleteCommand({
          TableName: "Orders",
          Key: {
            orderId: order.orderId,
          },
        })
      );

      return Response.json({
        success: true,
        message: "Order cancelled and deleted successfully.",
        status: "cancelled",
        deleted: true,
      });
    }

    // CONFIRM ORDER
    // The order remains in DynamoDB and its status becomes confirmed.
    await dynamoDB.send(
      new UpdateCommand({
        TableName: "Orders",
        Key: {
          orderId: order.orderId,
        },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": "confirmed",
        },
      })
    );

    return Response.json({
      success: true,
      message: "Order confirmed successfully.",
      status: "confirmed",
      deleted: false,
    });
  } catch (error) {
    console.error("Update order error:", error);

    return Response.json(
      {
        error: "Unable to update the order.",
      },
      { status: 500 }
    );
  }
}

