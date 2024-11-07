import UserAvatar from "./_components/user-avatar";

export default function Page() {
  return (
    <main className="flex flex-col items-center gap-4 p-24">
      <h1 className="text-4xl font-bold text-primary">Sophys Sapucaia UI</h1>
      <p className="text-lg">
        This is the UI for experiments conducted at the Sapucaia beamline.
      </p>
      <UserAvatar />
    </main>
  );
}
