import "dotenv/config";
import readline from "readline";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "local",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
  },
});

const db = DynamoDBDocumentClient.from(client);

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askPassword(question) {
  return new Promise((resolve, reject) => {
    process.stdout.write(question);

    const stdin = process.stdin;

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let password = "";

    const onData = (char) => {
      // Ctrl+C
      if (char === "\u0003") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        reject(new Error("Operation cancelled."));
        return;
      }

      // Enter
      if (char === "\r" || char === "\n") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
        return;
      }

      // Backspace
      if (char === "\u007f" || char === "\b") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }

      // Normal character
      password += char;
      process.stdout.write("*");
    };

    stdin.on("data", onData);
  });
}

async function main() {
  console.log("\n=================================");
  console.log("       CREATE ADMIN ACCOUNT");
  console.log("=================================\n");

  // Check whether an admin already exists
  const existingAdmins = await db.send(
    new ScanCommand({
      TableName: "Users",
      FilterExpression: "#role = :admin",
      ExpressionAttributeNames: {
        "#role": "role",
      },
      ExpressionAttributeValues: {
        ":admin": "admin",
      },
    })
  );

  if (existingAdmins.Items && existingAdmins.Items.length > 0) {
    console.log("An administrator account already exists.");
    console.log("Only one administrator is allowed.\n");
    process.exit(1);
  }

  let username = await ask("Admin username: ");
  username = username.toLowerCase();

  if (!username) {
    console.log("Username is required.");
    process.exit(1);
  }

  if (!/^[a-z0-9._-]+$/.test(username)) {
    console.log(
      "Invalid username. Use only letters, numbers, dots, underscores or hyphens."
    );
    process.exit(1);
  }

  const password = await askPassword("Admin password: ");

  if (!password || password.length < 6) {
    console.log("Password must contain at least 6 characters.");
    process.exit(1);
  }

  const confirmation = await askPassword("Confirm password: ");

  if (password !== confirmation) {
    console.log("Passwords do not match.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = {
    // The Users table uses "email" as its partition key.
    // This is an internal value for the unique admin account.
    email: "admin@bookstore.local",

    username,

    firstName: "BookStore",
    lastName: "Administrator",
    name: "BookStore Administrator",

    password: hashedPassword,

    role: "admin",

    createdAt: new Date().toISOString(),
  };

  await db.send(
    new PutCommand({
      TableName: "Users",
      Item: admin,
      ConditionExpression: "attribute_not_exists(email)",
    })
  );

  console.log("\n=================================");
  console.log("   ADMIN CREATED SUCCESSFULLY");
  console.log("=================================");
  console.log(`Username: ${username}`);
  console.log("Password: ********");
  console.log("Role: admin");
  console.log("\nYou can now use /admin/signin.");
}

main().catch((error) => {
  console.error("\nError creating admin:", error.message);
  process.exit(1);
});