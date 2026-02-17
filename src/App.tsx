import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
        Convex + React
      </header>
      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">Convex + React</h1>
        <Content />
      </main>
    </>
  );
}

function Content() {
  const data = useQuery(api.myFunctions.helloWorld, {});

  if (!data || !data.message) {
    return (
      <div className="mx-auto">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <p>{data.message}</p>
    </div>
  );
}
