import { NextRequest, NextResponse } from "next/server";
import {
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";
import bcrypt from "bcryptjs";

const USERS_TABLE = "Users";
const ADMIN_EMAIL = "admin@bookstore.local";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      username,
      password,
      firstName,
      lastName,
      name,
      phone,
      address,
      action,
    } = body;

    // =========================================================
    // ADMIN LOGIN
    // =========================================================
    if (action === "admin-login") {
      if (!username || !password) {
        return NextResponse.json(
          { error: "Username and password are required." },
          { status: 400 }
        );
      }

      const enteredUsername = String(username)
        .trim()
        .toLowerCase();

      // The administrator uses the fixed administrator email.
      // The username comparison below is case-insensitive.
      const result = await dynamoDB.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: {
            email: ADMIN_EMAIL,
          },
        })
      );

      const admin = result.Item;

      if (!admin) {
        return NextResponse.json(
          { error: "No administrator account found." },
          { status: 404 }
        );
      }

      if (admin.role !== "admin") {
        return NextResponse.json(
          {
            error:
              "This account is not an administrator account.",
          },
          { status: 403 }
        );
      }

      const storedUsername = String(admin.username || "")
        .trim()
        .toLowerCase();

      if (storedUsername !== enteredUsername) {
        return NextResponse.json(
          {
            error:
              "Invalid administrator username or password.",
          },
          { status: 401 }
        );
      }

      const storedPassword = String(
        admin.password || admin.storedPassword || ""
      );

      if (!storedPassword) {
        return NextResponse.json(
          {
            error:
              "Administrator password is not configured.",
          },
          { status: 500 }
        );
      }

      const passwordValid = await bcrypt.compare(
        String(password),
        storedPassword
      );

      if (!passwordValid) {
        return NextResponse.json(
          {
            error:
              "Invalid administrator username or password.",
          },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          email: admin.email,
          username: admin.username || "",
          firstName: admin.firstName || "",
          lastName: admin.lastName || "",
          name:
            admin.name ||
            `${admin.firstName || ""} ${
              admin.lastName || ""
            }`.trim(),
          role: "admin",
        },
      });
    }

    // =========================================================
    // CUSTOMER LOGIN
    // =========================================================
    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required." },
          { status: 400 }
        );
      }

      const normalizedEmail = String(email)
        .trim()
        .toLowerCase();

      const result = await dynamoDB.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: {
            email: normalizedEmail,
          },
        })
      );

      const user = result.Item;

      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      const storedPassword = String(
        user.password || user.storedPassword || ""
      );

      const passwordValid = await bcrypt.compare(
        String(password),
        storedPassword
      );

      if (!passwordValid) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          email: user.email,
          username: user.username || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          name:
            user.name ||
            `${user.firstName || ""} ${
              user.lastName || ""
            }`.trim(),
          phone: user.phone || "",
          address: user.address || "",
          role: user.role || "user",
        },
      });
    }

    // =========================================================
    // CUSTOMER SIGN UP
    // =========================================================

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const existingUser = await dynamoDB.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          email: normalizedEmail,
        },
      })
    );

    if (existingUser.Item) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(
      String(password),
      10
    );

    const newUser = {
      email: normalizedEmail,
      username: username
        ? String(username).trim()
        : "",
      firstName: firstName
        ? String(firstName).trim()
        : "",
      lastName: lastName
        ? String(lastName).trim()
        : "",
      name:
        name ||
        `${firstName || ""} ${lastName || ""}`.trim(),
      phone: phone
        ? String(phone).trim()
        : "",
      address: address
        ? String(address).trim()
        : "",
      password: hashedPassword,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: newUser,
      })
    );

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          email: newUser.email,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          name: newUser.name,
          phone: newUser.phone,
          address: newUser.address,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Users API error:", error);

    return NextResponse.json(
      {
        error:
          "An error occurred while processing the request.",
      },
      { status: 500 }
    );
  }
}