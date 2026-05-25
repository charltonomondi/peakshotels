import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Peaks Hotel Nanyuki" className="h-12 w-12 object-contain" />
            <span className="text-lg font-semibold tracking-tight">Peaks Hotel Nanyuki</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#rooms" className="hover:text-primary">Rooms</a>
            <a href="#about" className="hover:text-primary">About</a>
            <a href="#contact" className="hover:text-primary">Contact</a>
            <Link
              to="/admin/login"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <img src={logo} alt="" className="mx-auto h-28 w-28 object-contain" />
          <h1 className="mt-6 text-5xl font-bold tracking-tight">
            Peaks Hotel Nanyuki
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Comfort and hospitality at the foot of Mt Kenya. Restful stays, warm
            service, and stunning views.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a
              href="#rooms"
              className="rounded-md bg-primary px-6 py-3 text-primary-foreground hover:opacity-90"
            >
              Explore rooms
            </a>
            <a
              href="#contact"
              className="rounded-md border border-border bg-card px-6 py-3 hover:bg-secondary"
            >
              Contact us
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
