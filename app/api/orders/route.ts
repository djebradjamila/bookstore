import {
  PutCommand,
  QueryCommand,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

// --------------------------------------------------
// GET - Get orders for a user or all orders for admin
// --------------------------------------------------

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userEmail = searchParams.get("userEmail");
    const isAdmin = searchParams.get("admin") === "true";

    // ADMIN - Get all orders
    if (isAdmin) {
      const result = await dynamoDB.send(
        new QueryCommand({
          TableName: "Orders",
          IndexName: "userEmail-index",
          KeyConditionExpression: "userEmail = :userEmail",
          ExpressionAttributeValues: {
            ":userEmail": "admin",
          },
        })
      );

      return Response.json({
        success: true,
        orders: result.Items || [],
      });
    }

    // USER - Get orders for one user
    if (!userEmail) {
      return Response.json(
        {
          success: false,
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
        success: false,
        error: "Unable to load orders.",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// POST - Create a new order
// --------------------------------------------------

export async function POST(request: Request) {
  try {
    const {
      userEmail,
      firstName,
      lastName,
      phone,
      country,
      region,
      city,
      address,
      items,
      total,
    } = await request.json();

    // --------------------------------------------------
    // Validate required order information
    // --------------------------------------------------

    if (
      !userEmail ||
      !firstName ||
      !lastName ||
      !phone ||
      !country ||
      !region ||
      !city ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0 ||
      total === undefined
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Customer information, delivery information, items and total are required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Validate every order item
    // --------------------------------------------------

    for (const item of items) {
      if (
        !item ||
        !item.id ||
        typeof item.id !== "string" ||
        !item.title ||
        Number(item.quantity) <= 0
      ) {
        return Response.json(
          {
            success: false,
            error:
              "Each order item must contain a valid book ID, title and quantity.",
          },
          { status: 400 }
        );
      }
    }

    // --------------------------------------------------
    // Combine quantities for duplicate books
    // --------------------------------------------------

    const quantities = new Map<string, number>();

    for (const item of items) {
      const bookId = String(item.id).trim();
      const quantity = Number(item.quantity);

      quantities.set(
        bookId,
        (quantities.get(bookId) || 0) + quantity
      );
    }

    // --------------------------------------------------
    // Check stock before creating the order
    //
    // IMPORTANT:
    // Stock is NOT decreased here.
    //
    // The stock will only be decreased when the admin
    // confirms the order.
    // --------------------------------------------------

    for (const [bookId, quantity] of quantities) {
      const bookResult = await dynamoDB.send(
        new GetCommand({
          TableName: "Books",
          Key: {
            id: bookId,
          },
        })
      );

      const book = bookResult.Item;

      // Book does not exist
      if (!book) {
        return Response.json(
          {
            success: false,
            error: `Book with ID "${bookId}" was not found.`,
          },
          { status: 404 }
        );
      }

      const stock = Number(book.stock || 0);

      // Not enough stock
      if (stock < quantity) {
        return Response.json(
          {
            success: false,
            error: `Not enough stock for "${book.title}". Only ${stock} available.`,
          },
          { status: 409 }
        );
      }
    }

    // --------------------------------------------------
    // Create order
    //
    // Status remains pending.
    // Stock is NOT changed here.
    // --------------------------------------------------

    const orderId = `ORD-${Date.now()}`;

    const order = {
      orderId,

      userEmail: userEmail.trim().toLowerCase(),

      // Customer information
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),

      // Delivery information
      country: country.trim(),
      region: region.trim(),
      city: city.trim(),
      address: address.trim(),

      // Order information
      items,
      total: Number(total),

      // Admin must confirm the order
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
        success: true,
        message: "Order created successfully.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return Response.json(
      {
        success: false,
        error: "Something went wrong while creating the order.",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PATCH - Cancel an order
//
// The client can only cancel a pending order.
// Order confirmation is handled by the admin.
// --------------------------------------------------

export async function PATCH(request: Request) {
  try {
    const { orderId, userEmail, action } =
      await request.json();

    if (!orderId || !userEmail || !action) {
      return Response.json(
        {
          success: false,
          error:
            "Order ID, user email and action are required.",
        },
        { status: 400 }
      );
    }

    // The client can only cancel.
    if (action !== "cancel") {
      return Response.json(
        {
          success: false,
          error:
            "Order confirmation is handled by the administrator.",
        },
        { status: 403 }
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

    const order = result.Items?.find(
      (item) => item.orderId === orderId
    );

    if (!order) {
      return Response.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // Only pending orders can be cancelled.
    if (order.status !== "pending") {
      return Response.json(
        {
          success: false,
          error: "Only pending orders can be cancelled.",
        },
        { status: 400 }
      );
    }

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
  } catch (error) {
    console.error("Cancel order error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to cancel the order.",
      },
      { status: 500 }
    );
  }
}