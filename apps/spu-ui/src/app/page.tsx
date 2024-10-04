import Link from "next/link";
import { auth, signOut } from "@sophys-web/auth";
import { Button, buttonVariants } from "@sophys-web/ui/button";

export default async function Page() {
  const session = await auth();
  return (
    <main className="flex flex-col items-center gap-4 p-24">
      <h1 className="text-primary text-4xl font-bold">Sophys Sapucaia UI</h1>
      <p className="text-lg">
        This is the UI for experiments conducted at the Sapucaia beamline.
      </p>

      {!session ? (
        <>
          <p className="text-lg">Please, sign in to continue.</p>
          <Link
            className={buttonVariants({ variant: "link" })}
            href="/api/auth/signin"
          >
            Sign in
          </Link>
        </>
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
    </main>
  );
}
