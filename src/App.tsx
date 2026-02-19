export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
        Star Wars Chatbot
      </header>
      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">Star Wars Chatbot</h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400">
          Chat to your favorite Star Wars characters! Powered by OpenAI and
          Convex.
        </p>
      </main>
    </>
  );
}
