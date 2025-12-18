import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });

      toast({
        title: "Email sent successfully 📧",
        description: "Check your inbox for the password reset link.",
      });

      setEmail(""); // clear input
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send email",
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">

       <div className="relative w-full max-w-md">
      <Card className="w-full max-w-md shadow-lg">
        {/* ❌ Cross FIXED inside card */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold">
            Forgot your password?
          </CardTitle>
          <CardDescription>
            No worries! Enter your registered email and we’ll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default ForgotPassword;
