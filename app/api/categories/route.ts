import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

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

const CATEGORIES_TABLE = "Categories";
const BOOKS_TABLE = "Books";

// --------------------------------------------------
// GET - Get all categories
// --------------------------------------------------

export async function GET() {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: CATEGORIES_TABLE,
      })
    );

    const categories = (result.Items || [])
      .map((item) => ({
        id: item.id?.S || "",
        name: item.name?.S || "",
        description: item.description?.S || "",
        icon: item.icon?.S || "BookOpen",
      }))
      .filter((category) => category.id && category.name);

    categories.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories.",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// POST - Add a category
// --------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const icon =
      typeof body.icon === "string" && body.icon.trim()
        ? body.icon.trim()
        : "BookOpen";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category name must contain between 2 and 100 characters.",
        },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category description must contain at most 500 characters.",
        },
        { status: 400 }
      );
    }

    // Check duplicate category name
    const existing = await client.send(
      new ScanCommand({
        TableName: CATEGORIES_TABLE,
      })
    );

    const duplicate = (existing.Items || []).some(
      (item) =>
        item.name?.S?.trim().toLowerCase() ===
        name.toLowerCase()
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "This category already exists.",
        },
        { status: 409 }
      );
    }

    const id = `CAT-${Date.now()}`;

    await client.send(
      new PutItemCommand({
        TableName: CATEGORIES_TABLE,
        Item: {
          id: { S: id },
          name: { S: name },
          description: { S: description },
          icon: { S: icon },
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "Category added successfully.",
      category: {
        id,
        name,
        description,
        icon,
      },
    });
  } catch (error) {
    console.error("POST category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category.",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PUT - Update a category
// --------------------------------------------------

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const icon =
      typeof body.icon === "string" && body.icon.trim()
        ? body.icon.trim()
        : "BookOpen";

    if (!id || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category id and name are required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category name must contain between 2 and 100 characters.",
        },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category description must contain at most 500 characters.",
        },
        { status: 400 }
      );
    }

    // Find the existing category
    const categoriesResult = await client.send(
      new ScanCommand({
        TableName: CATEGORIES_TABLE,
      })
    );

    const existingCategory = (
      categoriesResult.Items || []
    ).find((item) => item.id?.S === id);

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    const oldName =
      existingCategory.name?.S?.trim() || "";

    // Prevent duplicate category names
    const duplicate = (
      categoriesResult.Items || []
    ).some(
      (item) =>
        item.id?.S !== id &&
        item.name?.S?.trim().toLowerCase() ===
          name.toLowerCase()
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another category with this name already exists.",
        },
        { status: 409 }
      );
    }

    // Update the category itself
    await client.send(
      new UpdateItemCommand({
        TableName: CATEGORIES_TABLE,
        Key: {
          id: { S: id },
        },
        UpdateExpression:
          "SET #name = :name, #description = :description, #icon = :icon",
        ExpressionAttributeNames: {
          "#name": "name",
          "#description": "description",
          "#icon": "icon",
        },
        ExpressionAttributeValues: {
          ":name": { S: name },
          ":description": { S: description },
          ":icon": { S: icon },
        },
      })
    );

    // If the category name changed,
    // update all books using the old category name.
    if (oldName !== name) {
      const booksResult = await client.send(
        new ScanCommand({
          TableName: BOOKS_TABLE,
        })
      );

      const booksToUpdate = (
        booksResult.Items || []
      ).filter(
        (book) =>
          book.category?.S?.trim() === oldName
      );

      for (const book of booksToUpdate) {
        if (!book.id?.S) {
          continue;
        }

        await client.send(
          new UpdateItemCommand({
            TableName: BOOKS_TABLE,
            Key: {
              id: { S: book.id.S },
            },
            UpdateExpression:
              "SET #category = :category",
            ExpressionAttributeNames: {
              "#category": "category",
            },
            ExpressionAttributeValues: {
              ":category": { S: name },
            },
          })
        );
      }

      console.log(
        `Updated ${booksToUpdate.length} book(s) from category "${oldName}" to "${name}".`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: {
        id,
        name,
        description,
        icon,
      },
    });
  } catch (error) {
    console.error("PUT category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update category.",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// DELETE - Delete a category
// --------------------------------------------------

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    // Find category
    const categoriesResult = await client.send(
      new ScanCommand({
        TableName: CATEGORIES_TABLE,
      })
    );

    const category = (
      categoriesResult.Items || []
    ).find((item) => item.id?.S === id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    const categoryName =
      category.name?.S?.trim() || "";

    // Check whether books still use this category
    const booksResult = await client.send(
      new ScanCommand({
        TableName: BOOKS_TABLE,
      })
    );

    const booksUsingCategory = (
      booksResult.Items || []
    ).filter(
      (book) =>
        book.category?.S?.trim() === categoryName
    );

    // Do NOT delete books automatically
    if (booksUsingCategory.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Cannot delete category "${categoryName}" because ${booksUsingCategory.length} book(s) still use it. Please move or delete those books first.`,
          booksCount: booksUsingCategory.length,
        },
        { status: 409 }
      );
    }

    // Delete category
    await client.send(
      new DeleteItemCommand({
        TableName: CATEGORIES_TABLE,
        Key: {
          id: { S: id },
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: `Category "${categoryName}" deleted successfully.`,
    });
  } catch (error) {
    console.error("DELETE category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category.",
      },
      { status: 500 }
    );
  }
}