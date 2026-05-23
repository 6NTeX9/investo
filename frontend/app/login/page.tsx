export const metadata = {
  title: "Admin Login"
};

export default function LoginPage() {
  return (
    <main className="section-shell grid min-h-[70svh] place-items-center pt-12">
      <form className="w-full max-w-md rounded-lg bg-white p-8 luxury-shadow">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Secure admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
        <div className="mt-8 grid gap-4">
          <input className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm" placeholder="Email" />
          <input className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm" type="password" placeholder="Password" />
          <button className="rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white">Login</button>
        </div>
      </form>
    </main>
  );
}
