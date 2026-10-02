import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { dynamoDB } from "@/lib/dynamodb";

export async function POST(request: Request) {
try {
const {
firstName,
lastName,
name,
email,
username,
password,
action,
} = await request.json();


// --------------------------------------------------
// ADMIN LOGIN
// Username + password
// --------------------------------------------------

if (action === "admin-login") {
  if (!username || !password) {
    return Response.json(
      { error: "Username and password are required." },
      { status: 400 }
    );
  }

  const normalizedUsername = username.trim().toLowerCase();

  const result = await dynamoDB.send(
    new ScanCommand({
      TableName: "Users",
      FilterExpression:
        "#username = :username AND #role = :admin",
      ExpressionAttributeNames: {
        "#username": "username",
        "#role": "role",
      },
      ExpressionAttributeValues: {
        ":username": normalizedUsername,
        ":admin": "admin",
      },
    })
  );

  const admin = result.Items?.[0];

  if (!admin) {
    return Response.json(
      { error: "No administrator account found with this username." },
      { status: 404 }
    );
  }

  const passwordMatch = await bcrypt.compare(
    password,
    admin.password
  );

  if (!passwordMatch) {
    return Response.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  return Response.json({
    message: "Admin login successful.",
    user: {
      firstName: admin.firstName || "BookStore",
      lastName: admin.lastName || "Administrator",
      name: admin.name || "BookStore Administrator",
      username: admin.username,
      email: admin.email,
      role: "admin",
    },
  });
}

// --------------------------------------------------
// CLIENT LOGIN
// Email + password
// --------------------------------------------------

if (action === "login") {
  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

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
      {
        error: "No account found with this email.",
      },
      { status: 404 }
    );
  }

  const passwordMatch = await bcrypt.compare(
    password,
    result.Item.password
  );

  if (!passwordMatch) {
    return Response.json(
      {
        error: "Incorrect password.",
      },
      { status: 401 }
    );
  }

  // Existing accounts without a role
  // are treated as normal users.
  const role =
    result.Item.role === "admin"
      ? "admin"
      : "user";

  const firstNameValue =
    result.Item.firstName ||
    result.Item.name?.trim().split(/\s+/)[0] ||
    "";

  const lastNameValue =
    result.Item.lastName ||
    result.Item.name?.trim().split(/\s+/).slice(1).join(" ") ||
    "";

  return Response.json({
    message: "Login successful.",
    user: {
      firstName: firstNameValue,
      lastName: lastNameValue,
      name:
        result.Item.name ||
        `${firstNameValue} ${lastNameValue}`.trim(),
      email: result.Item.email,
      role,
    },
  });
}

// --------------------------------------------------
// CLIENT SIGN UP
// --------------------------------------------------

if (!firstName || !lastName || !email || !password) {
  return Response.json(
    {
      error:
        "First name, last name, email and password are required.",
    },
    { status: 400 }
  );
}

if (password.length < 6) {
  return Response.json(
    {
      error:
        "Password must contain at least 6 characters.",
    },
    { status: 400 }
  );
}

const normalizedEmail = email.trim().toLowerCase();

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
    {
      error:
        "An account with this email already exists.",
    },
    { status: 409 }
  );
}

const hashedPassword = await bcrypt.hash(
  password,
  10
);

const cleanFirstName = firstName.trim();
const cleanLastName = lastName.trim();

const fullName =
  `${cleanFirstName} ${cleanLastName}`;

// Every normal registration creates
// a regular user account.
const role = "user";

await dynamoDB.send(
  new PutCommand({
    TableName: "Users",

    Item: {
      email: normalizedEmail,

      firstName: cleanFirstName,

      lastName: cleanLastName,

      name: fullName,

      password: hashedPassword,

      role,

      createdAt: new Date().toISOString(),
    },
  })
);

return Response.json(
  {
    message:
      "Account created successfully.",

    user: {
      firstName: cleanFirstName,
      lastName: cleanLastName,
      name: fullName,
      email: normalizedEmail,
      role,
    },
  },
  { status: 201 }
);


} catch (error) {
console.error("User API error:", error);


return Response.json(
  {
    error: "Something went wrong.",
  },
  { status: 500 }
);


}
}
