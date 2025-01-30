import AuthGuard from "@/components/authGuard";
import Link from "next/link";

export default function Index() {
  return (
    <AuthGuard isPublic>
      <div>
        <h1>Welcome to the Home Page</h1>
      </div>
    </AuthGuard>
  );
}
