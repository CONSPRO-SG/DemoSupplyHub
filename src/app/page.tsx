import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import { ConvexAuthForm } from "@/components/convex-auth-form";

export default async function HomePage() {
  const isAuthenticated = await isAuthenticatedNextjs();
  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <main className="container">
      <section className="grid grid-2">
        <article className="panel">
          <h2 style={{ marginTop: 0 }}>Industrial Consumable Control</h2>
          <p className="muted">
            Track stock levels, movements, and low-level alerts for factory consumables.
          </p>
          <div className="metric">
            Default admin:
            <br />
            <strong>admin@conspro.local / admin123</strong>
          </div>
        </article>
        <article className="panel">
          <h2 style={{ marginTop: 0 }}>Sign In</h2>
          <ConvexAuthForm />
        </article>
      </section>

      <section className="grid grid-2" style={{ marginTop: "1rem" }}>
        <article id="about" className="panel">
          <h3 style={{ marginTop: 0 }}>About</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            This platform manages industrial consumables, movement history, and low-stock
            alerts in one place.
          </p>
        </article>

        <article id="contact-details" className="panel">
          <h3 style={{ marginTop: 0 }}>Contact Details</h3>
          <p style={{ margin: 0 }}>
            Operations Support
            <br />
            +1 (555) 010-4040
            <br />
            support@conspro.local
          </p>
        </article>
      </section>

      <section id="cart" className="panel" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Cart</h3>
        <p className="muted" style={{ marginBottom: 0 }}>
          Cart is currently empty.
        </p>
      </section>
    </main>
  );
}
