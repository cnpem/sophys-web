import Link from "next/link";
import { auth, signOut } from "@sophys-web/auth";
import { Button, buttonVariants } from "@sophys-web/ui/button";
import { Input } from "@sophys-web/ui/input";
import ClickMe from "./_components/click-me";

export default async function Page() {
  const session = await auth();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {session ? (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold">Welcome {session.user.name}</h1>
          <p className="text-lg">Your email is {session.user.email}</p>
        </div>
      ) : null}
      <div className="my-auto flex flex-col items-center gap-2">
        <Input placeholder="Enter your email" type="email" />
        <div className="flex gap-1">
          <ClickMe />
          {!session ? (
            <Link
              className={buttonVariants({ variant: "link" })}
              href="/api/auth/signin"
            >
              Sign in
            </Link>
          ) : (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button type="submit" variant="link">
                Sign out
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
