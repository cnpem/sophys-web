import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOutIcon, UserIcon } from "lucide-react";
import { auth, signOut } from "@sophys-web/auth";
import { Button, buttonVariants } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";

function getInitials(name: string): string {
  return name
    .split(/[ .]+/) // Split by spaces or dots
    .filter(Boolean) // Remove empty strings
    .map((part) => part[0]?.toUpperCase()) // Take the first letter and convert to uppercase
    .join(""); // Combine into a single string
}

export default async function UserAvatar() {
  const session = await auth();
  const initials = getInitials(session?.user.name ?? "unknown");

  if (!session) {
    return (
      <Link className={buttonVariants({ variant: "link" })} href="/auth/signin">
        Sign in
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
          variant="ghost"
        >
          <UserIcon className="h-4 w-4" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{initials}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserIcon className="h-4 w-4" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {session.user.name}
              </span>
              <span className="truncate text-xs">
                {session.user.roles?.join(", ")}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({
          redirect: false,
        });
        redirect("/");
      }}
    >
      <Button
        className="flex w-full justify-start gap-2 p-0"
        type="submit"
        size="sm"
        variant="ghost"
      >
        <LogOutIcon />
        Log out
      </Button>
    </form>
  );
}
