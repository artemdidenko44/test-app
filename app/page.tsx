import Image from "next/image";
import { Header } from "../components/header";
import { SearchForm } from "../components/search-form";

export default function Home() {
  const tours: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Header
        logo={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Image
              src="/vercel.svg"
              alt="TestApp logo"
              width={20}
              height={20}
            />
            <span>TestApp</span>
          </div>
        }
        actions={<SearchForm />}
      />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {tours.length === 0 ? (
          <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
            <span>Немає доступних турів</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <div key={tour.id}>
                {/* Card goes here */}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
