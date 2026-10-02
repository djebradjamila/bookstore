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
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
  },
});

const CATEGORIES_TABLE = "Categories";
const BOOKS_TABLE = "Books";

// GET - Get all categories
export async function GET() {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: CATEGORIES_TABLE,
      })
    );

    const categories = (result.Items || []).map((item) => ({
      id: item.id?.S || "",
      name: item.name?.S || "",
      description: item.description?.S || "",
      icon: item.icon?.S || "BookOpen",
    }));

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

// POST - Add a category
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const description = body.description?.trim() || "";
    const icon = body.icon?.trim() || "BookOpen";

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 }
      );
    }

    // Check duplicate category
    const existing = await client.send(
      new ScanCommand({
        TableName: CATEGORIES_TABLE,
      })
    );

    const duplicate = (existing.Items || []).some(
      (item) => item.name?.S?.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "This category already exists",
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
        message: "Failed to create category",
      },
      { status: 500 }
    );
  }
}

// PUT - Update a category
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id = body.id?.trim();
    const name = body.name?.trim();
    const description = body.description?.trim() || "";
    const icon = body.icon?.trim() || "BookOpen";

    if (!id || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category id and name are required",
        },
        { status: 400 }
      );
    }

    // Check category exists
    const existing = await client.send(
      new ScanCommand({
        TableName: CATEGORIES_TABLE,
      })
    );

    const categoryExists = (existing.Items || []).find(
      (item) => item.id?.S === id
    );

    if (!categoryExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // Check duplicate name
    const duplicate = (existing.Items || []).some(
      (item) =>
        item.id?.S !== id &&
        item.name?.S?.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Another category with this name already exists",
        },
        { status: 409 }
      );
    }

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

    return NextResponse.json({
      success: true,
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
        message: "Failed to update category",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete category + all books in this category
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category id is required",
        },
        { status: 400 }
      );
    }

    // Find the category
    const categoriesResult = await client.send(
      new ScanCommand({
        TableName: CATEGORIES_TABLE,
      })
    );

    const category = (categoriesResult.Items || []).find(
      (item) => item.id?.S === id
    );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    const categoryName = category.name?.S || "";

    // Find all books belonging to this category
    const booksResult = await client.send(
      new ScanCommand({
        TableName: BOOKS_TABLE,
      })
    );

    const booksToDelete = (booksResult.Items || []).filter(
      (book) => book.category?.S === categoryName
    );

    // Delete all books from this category
    for (const book of booksToDelete) {
      // Books table uses "title" as the primary key
      if (book.title?.S) {
        await client.send(
          new DeleteItemCommand({
            TableName: BOOKS_TABLE,
            Key: {
              title: { S: book.title.S },
            },
          })
        );
      }
    }

    // Delete the category
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
      message: `Category "${categoryName}" and ${booksToDelete.length} book(s) were deleted successfully`,
      deletedBooks: booksToDelete.length,
    });
  } catch (error) {
    console.error("DELETE category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category and its books",
      },
      { status: 500 }
    );
  }
}