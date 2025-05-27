import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: { id: params.id },
    });

    if (!bookmark) {
      return new NextResponse("Bookmark not found", { status: 404 });
    }

    if (bookmark.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.bookmark.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BOOKMARK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
