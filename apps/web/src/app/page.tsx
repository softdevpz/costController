export default async function HomePage() {
  let apiStatus = "nieznany";
  try {
    const res = await fetch(`${process.env.WEB_PUBLIC_API_URL}/health`, {
      cache: "no-store",
    });
    const data = await res.json();
    apiStatus = data.status;
  } catch {
    apiStatus = "offline";
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Budżet budowy domu</h1>
      <p>Status API: {apiStatus}</p>
    </main>
  );
}
