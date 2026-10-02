import { NextResponse } from "next/server";
import {
  ScanCommand,
  UpdateCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

// --------------------------------------------------
// GET - Get all orders
// --------------------------------------------------

export async function GET() {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: "Orders",
      })
    );

    const orders = result.Items || [];

    // Newest orders first
    orders.sort((a, b) => {
      const dateA = new Date(
        a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0
      ).getTime();

      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Admin GET orders error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load orders.",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PATCH - Admin order actions
//
// Actions:
// - confirm
//
// Confirmation:
// 1. Check that order is pending.
// 2. Check stock of every book.
// 3. Decrease stock.
// 4. Change order status to confirmed.
//
// Everything is done inside one DynamoDB transaction.
// --------------------------------------------------

export async function PATCH(request: Request) {
  try {
    const { orderId, action } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID and action are required.",
        },
        { status: 400 }
      );
    }

    if (action !== "confirm") {
      return NextResponse.json(
        {
          success: false,
          error:
            "The only available admin action is confirm.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Find the order
    // --------------------------------------------------

    const ordersResult = await dynamoDB.send(
      new ScanCommand({
        TableName: "Orders",
      })
    );

    const order = (ordersResult.Items || []).find(
      (item) => item.orderId === orderId
    );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // Only pending orders can be confirmed
    // --------------------------------------------------

    if (order.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only pending orders can be confirmed.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(order.items) ||
      order.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This order contains no items.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Prepare quantities by book ID
    //
    // If the same book appears more than once,
    // combine its quantities.
    // --------------------------------------------------

    const quantities = new Map<
      string,
      number
    >();

    for (const item of order.items) {
      const bookId = String(item?.id || "").trim();
      const quantity = Number(item?.quantity || 0);

      if (!bookId || quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "An order item is missing a valid book ID or quantity.",
          },
          { status: 400 }
        );
      }

      quantities.set(
        bookId,
        (quantities.get(bookId) || 0) + quantity
      );
    }

    // --------------------------------------------------
    // Build one transaction:
    //
    // - decrease stock for every book
    // - confirm the order
    //
    // The conditions guarantee:
    // - stock cannot become negative
    // - the order must still be pending
    // --------------------------------------------------

    const transactItems: any[] = [];

    for (const [bookId, quantity] of quantities) {
      transactItems.push({
        Update: {
          TableName: "Books",

          Key: {
            id: bookId,
          },

          UpdateExpression:
            "SET #stock = #stock - :quantity",

          ConditionExpression:
            "attribute_exists(id) AND attribute_exists(#stock) AND #stock >= :quantity",

          ExpressionAttributeNames: {
            "#stock": "stock",
          },

          ExpressionAttributeValues: {
            ":quantity": quantity,
          },
        },
      });
    }

    // Confirm the order only if it is still pending.
    transactItems.push({
      Update: {
        TableName: "Orders",

        Key: {
          orderId,
        },

        UpdateExpression:
          "SET #status = :confirmed, confirmedAt = :confirmedAt",

        ConditionExpression:
          "#status = :pending",

        ExpressionAttributeNames: {
          "#status": "status",
        },

        ExpressionAttributeValues: {
          ":pending": "pending",
          ":confirmed": "confirmed",
          ":confirmedAt":
            new Date().toISOString(),
        },
      },
    });

    // --------------------------------------------------
    // Execute transaction
    // --------------------------------------------------

    try {
      await dynamoDB.send(
        new TransactWriteCommand({
          TransactItems: transactItems,
        })
      );
    } catch (transactionError: any) {
      console.error(
        "Order confirmation transaction error:",
        transactionError
      );

      // DynamoDB cancels the complete transaction if
      // one of the stock conditions fails.
      if (
        transactionError?.name ===
          "TransactionCanceledException" ||
        transactionError?.name ===
          "ConditionalCheckFailedException"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The order cannot be confirmed because one or more books do not have enough stock.",
          },
          { status: 409 }
        );
      }

      throw transactionError;
    }

    return NextResponse.json({
      success: true,
      message:
        "Order confirmed and stock updated successfully.",
      status: "confirmed",
    });
  } catch (error) {
    console.error(
      "Admin confirm order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to confirm the order.",
      },
      { status: 500 }
    );
  }
}