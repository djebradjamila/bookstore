import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  ScanCommand,
  DeleteItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";

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

/* -------------------------------------------------------
   GET - Get regular customer users
------------------------------------------------------- */
export async function GET() {
  try {
    const usersResult = await client.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      })
    );

    const ordersResult = await client.send(
      new ScanCommand({
        TableName: ORDERS_TABLE,
      })
    );

    const orders = ordersResult.Items || [];

    const customerItems = (usersResult.Items || []).filter(
      (item) => item.role?.S === "user"
    );

    const users = customerItems.map((item) => {
      const email = item.email?.S || "";

      const userOrders = orders.filter(
        (order) =>
          order.userEmail?.S?.trim().toLowerCase() ===
          email.trim().toLowerCase()
      );

      const sortedOrders = [...userOrders].sort((a, b) => {
        const dateA = a.createdAt?.S
          ? new Date(a.createdAt.S).getTime()
          : 0;

        const dateB = b.createdAt?.S
          ? new Date(b.createdAt.S).getTime()
          : 0;

        return dateB - dateA;
      });

      const latestOrder = sortedOrders[0];

      const phone =
        latestOrder?.phone?.S ||
        item.phone?.S ||
        "";

      const addressParts = [
        latestOrder?.address?.S,
        latestOrder?.city?.S,
        latestOrder?.region?.S,
        latestOrder?.country?.S,
      ].filter(Boolean);

      const address =
        addressParts.join(", ") ||
        item.address?.S ||
        "";

      return {
        email,
        firstName: item.firstName?.S || "",
        lastName: item.lastName?.S || "",
        name: item.name?.S || "",
        phone,
        address,
        role: item.role?.S || "user",
        username: item.username?.S || "",
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

/* -------------------------------------------------------
   POST - Create a new user
------------------------------------------------------- */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName = String(body?.firstName || "").trim();
    const lastName = String(body?.lastName || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const phone = String(body?.phone || "").trim();
    const address = String(body?.address || "").trim();
    const role =
      body?.role === "admin" ? "admin" : "user";

    if (!firstName) {
      return NextResponse.json(
        {
          success: false,
          message: "First name is required.",
        },
        { status: 400 }
      );
    }

    if (!lastName) {
      return NextResponse.json(
        {
          success: false,
          message: "Last name is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 6 characters.",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingResult = await client.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      })
    );

    const existingUser = (existingResult.Items || []).find(
      (item) =>
        item.email?.S?.trim().toLowerCase() === email
    );

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdAt = new Date().toISOString();

    await client.send(
      new PutItemCommand({
        TableName: USERS_TABLE,
        Item: {
          email: {
            S: email,
          },
          firstName: {
            S: firstName,
          },
          lastName: {
            S: lastName,
          },
          name: {
            S: `${firstName} ${lastName}`.trim(),
          },
          password: {
            S: hashedPassword,
          },
          role: {
            S: role,
          },
          phone: {
            S: phone,
          },
          address: {
            S: address,
          },
          createdAt: {
            S: createdAt,
          },
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   PUT - Update a user
------------------------------------------------------- */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const originalEmail = String(
      body?.originalEmail || ""
    )
      .trim()
      .toLowerCase();

    const firstName = String(body?.firstName || "").trim();
    const lastName = String(body?.lastName || "").trim();
    const newEmail = String(body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(body?.password || "");
    const phone = String(body?.phone || "").trim();
    const address = String(body?.address || "").trim();

    const role =
      body?.role === "admin" ? "admin" : "user";

    if (!originalEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Original email is required.",
        },
        { status: 400 }
      );
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "First name and last name are required.",
        },
        { status: 400 }
      );
    }

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email.",
        },
        { status: 400 }
      );
    }

    // Get all users
    const usersResult = await client.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      })
    );

    const users = usersResult.Items || [];

    // Find original user
    const currentUser = users.find(
      (item) =>
        item.email?.S?.trim().toLowerCase() ===
        originalEmail
    );

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // Admin accounts cannot be modified from this page
    if (currentUser.role?.S !== "user") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Administrator accounts cannot be modified from this page.",
        },
        { status: 403 }
      );
    }

    // If email changes, check that new email is free
    if (newEmail !== originalEmail) {
      const emailAlreadyExists = users.some(
        (item) =>
          item.email?.S?.trim().toLowerCase() ===
          newEmail
      );

      if (emailAlreadyExists) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another user already uses this email.",
          },
          { status: 409 }
        );
      }
    }

    let hashedPassword = currentUser.password?.S || "";

    // Password is optional during editing
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password must contain at least 6 characters.",
          },
          { status: 400 }
        );
      }

      hashedPassword = await bcrypt.hash(password, 10);
    }

    const createdAt =
      currentUser.createdAt?.S ||
      new Date().toISOString();

    // Create the updated item first
    await client.send(
      new PutItemCommand({
        TableName: USERS_TABLE,
        Item: {
          email: {
            S: newEmail,
          },
          firstName: {
            S: firstName,
          },
          lastName: {
            S: lastName,
          },
          name: {
            S: `${firstName} ${lastName}`.trim(),
          },
          password: {
            S: hashedPassword,
          },
          role: {
            S: role,
          },
          phone: {
            S: phone,
          },
          address: {
            S: address,
          },
          createdAt: {
            S: createdAt,
          },
        },
      })
    );

    // Delete old item if email changed
    if (newEmail !== originalEmail) {
      await client.send(
        new DeleteItemCommand({
          TableName: USERS_TABLE,
          Key: {
            email: {
              S: originalEmail,
            },
          },
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error("PUT /api/admin/users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   DELETE - Delete a user
------------------------------------------------------- */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    const usersResult = await client.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      })
    );

    const user = (usersResult.Items || []).find(
      (item) =>
        item.email?.S?.trim().toLowerCase() === email
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
          message:
            "Administrator accounts cannot be deleted from this page.",
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
    console.error(
      "DELETE /api/admin/users error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user.",
      },
      { status: 500 }
    );
  }
}