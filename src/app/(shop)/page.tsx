import { getShoes } from "@/lib/queries";
import { ShoeGrid } from "@/components/shoe-grid";

export default async function Home() {
  const shoes = await getShoes();

  return <ShoeGrid shoes={shoes} />;
}
