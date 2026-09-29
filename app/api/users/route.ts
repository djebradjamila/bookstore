
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { dynamoDB } from "@/lib/dynamodb";

export async function POST(request: Request) {
  try {
    const {
      firstName,
      lastName,
      name,
      email,
      password,
      action,
    } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // LOGIN
    if (action === "login") {
      const result = await dynamoDB.send(
        new GetCommand({
          TableName: "Users",
          Key: {
            email: normalizedEmail,
          },
        })
      );

      if (!result.Item) {
        return Response.json(
          { error: "No account found with this email." },
          { status: 404 }
        );
      }

      const passwordMatch = await bcrypt.compare(
        password,
        result.Item.password
      );

      if (!passwordMatch) {
        return Response.json(
          { error: "Incorrect password." },
          { status: 401 }
        );
      }

      return Response.json({
        message: "Login successful.",
        user: {
          firstName:
            result.Item.firstName ||
            result.Item.name?.trim().split(/\s+/)[0] ||
            "",
          lastName:
            result.Item.lastName ||
            result.Item.name?.trim().split(/\s+/).slice(1).join(" ") ||
            "",
          name: result.Item.name,
          email: result.Item.email,
        },
      });
    }

    // SIGN UP
    if (!firstName || !lastName) {
      return Response.json(
        { error: "First name and last name are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must contain at least 6 characters." },
        { status: 400 }
      );
    }

    const existingUser = await dynamoDB.send(
      new GetCommand({
        TableName: "Users",
        Key: {
          email: normalizedEmail,
        },
      })
    );

    if (existingUser.Item) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const fullName = `${cleanFirstName} ${cleanLastName}`;

    await dynamoDB.send(
      new PutCommand({
        TableName: "Users",
        Item: {
          email: normalizedEmail,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          name: fullName,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
        },
      })
    );

    return Response.json(
      {
        message: "Account created successfully.",
        user: {
          firstName: cleanFirstName,
          lastName: cleanLastName,
          name: fullName,
          email: normalizedEmail,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User API error:", error);

    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

