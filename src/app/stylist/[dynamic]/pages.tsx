import { useParams } from "next/navigation";

export default function StylistPage() {
  const { dynamic } = useParams(); // Access the dynamic part of the URL

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Stylist Profile</h1>
      <p className="text-lg mt-4">
        Welcome to the profile of stylist: {dynamic}
      </p>
    </div>
  );
}
