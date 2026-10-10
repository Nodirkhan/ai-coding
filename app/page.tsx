export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center font-sans">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Trackly
      </h1>
      <p className="mt-3 max-w-md text-base text-zinc-600">
        A small issue tracker. The project scaffold is set up — the issue
        list, creation, and detail views are coming in the next tickets.
      </p>
    </div>
  );
}
