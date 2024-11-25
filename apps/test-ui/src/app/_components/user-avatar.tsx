import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOutIcon, UserIcon } from "lucide-react";
import { auth, signOut } from "@sophys-web/auth";
import { Button, buttonVariants } from "@sophys-web/ui/button";

export default async function UserAvatar() {
  const session = await auth();
  if (!session) {
    return (
      <Link className={buttonVariants({ variant: "link" })} href="/auth/signin">
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center">
      <UserIcon className="h-4 w-4" />
      <span className="ml-2 mr-2">{session.user.name}</span>
      <form
        action={async () => {
          "use server";
          await signOut({
            redirect: false,
          });
          redirect("/");
        }}
      >
        <Button size="icon" type="submit" variant="ghost">
          <LogOutIcon className="h-4 w-4 text-primary" />
        </Button>
      </form>
    </div>
  );
}
