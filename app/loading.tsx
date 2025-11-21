import Navbar from "@/components/Navbar";

// Shows a loading spinner while page content is being fetched
export default function Loading() {
  return (
    <main className="bg-[#FCFAF7] text-black min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-black"></div>
      </div>
    </main>
  );
}
