import HomeNavbar from "@/components/HomeNavbar";
import NewHomePage from "@/components/NewHomePage";

// Landing page showcasing Rumik AI's mission and team
export default function Page() {
  return (
    <main className="bg-[#FCFAF7] text-black min-h-screen">
      <HomeNavbar />
      <NewHomePage />
    </main>
  );
}
