
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

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

