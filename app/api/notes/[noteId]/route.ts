import { auth } from "@/lib/auth-compat";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = await auth();
    const { noteId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const note = await db.note.findUnique({
      where: {
        id: noteId,
        userId,
      },
      include: {
        video: {
          select: {
            title: true,
            videoId: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!note) {
      return new NextResponse("Note not found", { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    // console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = await auth();
    const { noteId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;

    const note = await db.note.update({
      where: {
        id: noteId,
        userId,
      },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    // console.error("Error updating note:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { userId } = await auth();
    const { noteId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const note = await db.note.delete({
      where: {
        id: noteId,
        userId,
      },
    });

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    // console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
