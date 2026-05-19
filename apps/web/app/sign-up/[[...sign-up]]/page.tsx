import { SignUp } from "@clerk/nextjs";
import { clerkConfig } from "@/lib/clerk-config";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <SignUp appearance={clerkConfig.appearance} />
    </div>
  );
}
