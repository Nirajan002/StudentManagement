import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-green-500">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-semibold">
          Page Not Found
        </h2>

        <p className="mt-2 text-muted-foreground">
          Sorry, the page you are looking for doesn't exist.
        </p>

        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
      </div>
    </div>
  );
}