import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    console.error("[NOTE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
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
    console.error("[NOTE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
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

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
