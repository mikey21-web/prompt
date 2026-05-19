import { SignIn } from "@clerk/nextjs";
import { clerkConfig } from "@/lib/clerk-config";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <SignIn appearance={clerkConfig.appearance} />
    </div>
  );
}
