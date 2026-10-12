import { getShoes, getSocialLinks } from "@/lib/queries";
import { ShoeGrid } from "@/components/shoe-grid";

export default async function Home() {
  const [shoes, social] = await Promise.all([getShoes(), getSocialLinks()]);

  return <ShoeGrid shoes={shoes} social={social} />;
}
