import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import fs from "fs/promises";
import path from "path";

const client = new DynamoDBClient({
  region: process.env.DYNAMODB_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId:
      process.env.DYNAMODB_ACCESS_KEY_ID || "local",
    secretAccessKey:
      process.env.DYNAMODB_SECRET_ACCESS_KEY || "local",
  },
});

// --------------------------------------------------
// GET - Get all books
// --------------------------------------------------

export async function GET() {
  try {
    const result = await client.send(
      new ScanCommand({
        TableName: "Books",
      })
    );

    return NextResponse.json({
      success: true,
      books: result.Items || [],
    });
  } catch (error) {
    console.error("DynamoDB GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch books.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// POST - Add a new book
// --------------------------------------------------

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const id = String(formData.get("id") || "");
    const title = String(formData.get("title") || "");
    const author = String(formData.get("author") || "");
    const price = Number(formData.get("price") || 0);
    const category = String(formData.get("category") || "");
    const description = String(
      formData.get("description") || ""
    );
    const stock = Number(formData.get("stock") || 0);

    const image = formData.get("image");

    // Validate required fields
    if (!id || !title || !author || !price) {
      return NextResponse.json(
        {
          success: false,
          message:
            "id, title, author and price are required.",
        },
        { status: 400 }
      );
    }

    let imagePath = "";

    // --------------------------------------------------
    // Save uploaded image
    // --------------------------------------------------

    if (image instanceof File && image.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ];

      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only JPG, PNG and WEBP images are allowed.",
          },
          { status: 400 }
        );
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Image must be smaller than 5 MB.",
          },
          { status: 400 }
        );
      }

      const extension =
        path.extname(image.name) || ".jpg";

      const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const fileName = `${safeTitle}-${Date.now()}${extension}`;

      const booksDirectory = path.join(
        process.cwd(),
        "public",
        "books"
      );

      await fs.mkdir(booksDirectory, {
        recursive: true,
      });

      const filePath = path.join(
        booksDirectory,
        fileName
      );

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await fs.writeFile(filePath, buffer);

      imagePath = `/books/${fileName}`;
    }

    // --------------------------------------------------
    // Save book in DynamoDB
    // --------------------------------------------------

    await client.send(
      new PutItemCommand({
        TableName: "Books",
        Item: {
          id: {
            S: id,
          },

          title: {
            S: title,
          },

          author: {
            S: author,
          },

          price: {
            N: String(price),
          },

          category: {
            S: category,
          },

          description: {
            S: description,
          },

          stock: {
            N: String(stock),
          },

          image: {
            S: imagePath,
          },
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "Book added successfully!",

      book: {
        id,
        title,
        author,
        price,
        category,
        description,
        stock,
        image: imagePath,
      },
    });
  } catch (error) {
    console.error("DynamoDB POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add book.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PUT - Edit an existing book
// --------------------------------------------------

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const id = String(formData.get("id") || "");
    const title = String(formData.get("title") || "");
    const author = String(formData.get("author") || "");
    const price = Number(formData.get("price") || 0);
    const category = String(formData.get("category") || "");
    const description = String(
      formData.get("description") || ""
    );
    const stock = Number(formData.get("stock") || 0);

    const image = formData.get("image");

    const existingImage = String(
      formData.get("existingImage") || ""
    );

    // Validate required fields
    if (!id || !title || !author || !price) {
      return NextResponse.json(
        {
          success: false,
          message:
            "id, title, author and price are required.",
        },
        { status: 400 }
      );
    }

    // Keep old image by default
    let imagePath = existingImage;

    // --------------------------------------------------
    // Save new image if selected
    // --------------------------------------------------

    if (image instanceof File && image.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ];

      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only JPG, PNG and WEBP images are allowed.",
          },
          { status: 400 }
        );
      }

      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Image must be smaller than 5 MB.",
          },
          { status: 400 }
        );
      }

      const extension =
        path.extname(image.name) || ".jpg";

      const safeTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const fileName = `${safeTitle}-${Date.now()}${extension}`;

      const booksDirectory = path.join(
        process.cwd(),
        "public",
        "books"
      );

      await fs.mkdir(booksDirectory, {
        recursive: true,
      });

      const filePath = path.join(
        booksDirectory,
        fileName
      );

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await fs.writeFile(filePath, buffer);

      imagePath = `/books/${fileName}`;
    }

    // --------------------------------------------------
    // Update book in DynamoDB
    // --------------------------------------------------

    await client.send(
      new PutItemCommand({
        TableName: "Books",

        Item: {
          id: {
            S: id,
          },

          title: {
            S: title,
          },

          author: {
            S: author,
          },

          price: {
            N: String(price),
          },

          category: {
            S: category,
          },

          description: {
            S: description,
          },

          stock: {
            N: String(stock),
          },

          image: {
            S: imagePath,
          },
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "Book updated successfully!",

      book: {
        id,
        title,
        author,
        price,
        category,
        description,
        stock,
        image: imagePath,
      },
    });
  } catch (error) {
    console.error("DynamoDB PUT Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update book.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// DELETE - Delete a book
// --------------------------------------------------

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const id = String(body.id || "");

    // Validate ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Book ID is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Delete book from DynamoDB
    // --------------------------------------------------

    await client.send(
      new DeleteItemCommand({
        TableName: "Books",

        Key: {
          id: {
            S: id,
          },
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "Book deleted successfully!",
    });
  } catch (error) {
    console.error("DynamoDB DELETE Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete book.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}