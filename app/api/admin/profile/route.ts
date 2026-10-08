import { NextRequest, NextResponse } from "next/server";
import {
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";
import bcrypt from "bcryptjs";

const USERS_TABLE = "Users";
const ADMIN_EMAIL = "admin@bookstore.local";

export async function GET() {
  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          email: ADMIN_EMAIL,
        },
      })
    );

    if (!result.Item) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator account not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: result.Item.email,
        name:
          result.Item.name ||
          `${result.Item.firstName || ""} ${
            result.Item.lastName || ""
          }`.trim(),
        username: result.Item.username || "",
        role: result.Item.role || "admin",
      },
    });
  } catch (error) {
    console.error("Admin profile GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load administrator profile.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (password && password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const currentAdmin = await dynamoDB.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          email: ADMIN_EMAIL,
        },
      })
    );

    if (!currentAdmin.Item) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator account not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Prepare the update.
     *
     * Name and username are always updated.
     * Password is updated only when a new password was entered.
     */

    if (password) {
      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      await dynamoDB.send(
        new UpdateCommand({
          TableName: USERS_TABLE,
          Key: {
            email: ADMIN_EMAIL,
          },
          UpdateExpression:
            "SET #name = :name, #username = :username, #password = :password",
          ExpressionAttributeNames: {
            "#name": "name",
            "#username": "username",
            "#password": "password",
          },
          ExpressionAttributeValues: {
            ":name": name,
            ":username": username,
            ":password": hashedPassword,
          },
        })
      );
    } else {
      await dynamoDB.send(
        new UpdateCommand({
          TableName: USERS_TABLE,
          Key: {
            email: ADMIN_EMAIL,
          },
          UpdateExpression:
            "SET #name = :name, #username = :username",
          ExpressionAttributeNames: {
            "#name": "name",
            "#username": "username",
          },
          ExpressionAttributeValues: {
            ":name": name,
            ":username": username,
          },
        })
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        email: ADMIN_EMAIL,
        name,
        username,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin profile PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update administrator profile.",
      },
      { status: 500 }
    );
  }
}