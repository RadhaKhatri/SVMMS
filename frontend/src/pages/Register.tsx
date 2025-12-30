import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Wrench, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<
    "customer" | "mechanic" | "service_center_manager" | "admin"
  >("customer");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get form values
    const form = e.target as HTMLFormElement;
    const firstName = (form.querySelector("#firstName") as HTMLInputElement)
      .value;
    const lastName = (form.querySelector("#lastName") as HTMLInputElement)
      .value;
    const email = (form.querySelector("#email") as HTMLInputElement).value;
    const phone = (form.querySelector("#phone") as HTMLInputElement).value;
    const address = (form.querySelector("#address") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement)
      .value;
    const confirmPassword = (
      form.querySelector("#confirmPassword") as HTMLInputElement
    ).value;

    // Simple password confirmation check
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          address,
          password,
          role,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Registered!",
          description: "Your account has been created. Redirecting to login...",
        });
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast({
          title: "Error",
          description: result.message || "Registration failed",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Server error. Please try again later.",
      });
      console.error(err);
    }
  };

  console.log("Selected Role:", role);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-0 left-0 w-1/2 h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
      </div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <Card className="w-full max-w-lg bg-card/80 backdrop-blur-md border-border/100 shadow-2xl relative z-10">
          {/* ❌ Cross FIXED inside card */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
          <CardHeader className="text-center pb-2">
            <Link to="/" className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-2xl glow-primary">
                <Wrench className="h-10 w-10 text-primary" />
              </div>
            </Link>
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join SVMMS today and manage your vehicles
            </CardDescription>
          </CardHeader>

          {/* 🔥 Your Roles Here */}
          <Tabs
            value={role}
            onValueChange={(value) =>
              setRole(
                value as
                  | "customer"
                  | "mechanic"
                  | "service_center_manager"
                  | "admin"
              )
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
              <TabsTrigger
                value="customer"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs flex flex-col"
              >
                <span>Customer</span>
              </TabsTrigger>
              <TabsTrigger
                value="mechanic"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs flex flex-col"
              >
                <span>Mechanic</span>
              </TabsTrigger>
              <TabsTrigger
                value="service_center_manager"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs flex flex-col"
              >
                <span>Manager</span>
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs flex flex-col"
              >
                <span>Admin</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <CardContent className="pt-4">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    className="bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    className="bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="address"
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground font-semibold glow-primary hover:scale-[1.02] transition-transform"
              >
                Create Account
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?
              </span>{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-semibold"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
