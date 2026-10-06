import {
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

const TABLE_NAME = "Contacts";

// POST - Save a contact message
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !subject || !message) {
      return Response.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Response.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    const id = `CONTACT-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const createdAt = new Date().toISOString();

    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id,
          name,
          email,
          subject,
          message,
          status: "unread",
          createdAt,
        },
      })
    );

    return Response.json({
      success: true,
      message: "Your message has been sent successfully.",
      contact: {
        id,
        name,
        email,
        subject,
        message,
        status: "unread",
        createdAt,
      },
    });
  } catch (error) {
    console.error("Contact POST error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to send your message.",
      },
      { status: 500 }
    );
  }
}

// GET - Get all contact messages
export async function GET() {
  try {
    const result = await dynamoDB.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const contacts = (result.Items || []).sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    return Response.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Contact GET error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load contact messages.",
        contacts: [],
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a contact message
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || "").trim();

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Message ID is required.",
        },
        { status: 400 }
      );
    }

    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id,
        },
      })
    );

    return Response.json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Contact DELETE error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to delete the message.",
      },
      { status: 500 }
    );
  }
}