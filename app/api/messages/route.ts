import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "@/lib/dynamodb";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return Response.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const newMessage = {
      id: `MSG-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: "Messages",
        Item: newMessage,
      })
    );

    return Response.json(
      {
        success: true,
        message: "Message sent successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact message error:", error);

    return Response.json(
      {
        error: "Unable to send your message.",
      },
      { status: 500 }
    );
  }
}