import DotTriangleLoader from "@/components/DotTriangleLoader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <DotTriangleLoader size={40} dotSize={5} />
    </div>
  );
}
