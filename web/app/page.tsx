import Categories from "@/components/Categories";
import Plot from "@/components/Plot";

export default function Home() {
  return (
    <main className="flex flex-row">
        <Categories/>
        <Plot />
    </main>
  );
}
