import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, ShieldCheck, User, Wrench } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState("customer");

  const handleLogin = async (e: React.FormEvent, selectedRole: string) => {
  e.preventDefault();

  console.log("🔹 Login initiated");
  console.log("Selected role:", selectedRole);

  const email = (document.getElementById(`email-${selectedRole}`) as HTMLInputElement).value;
  const password = (document.getElementById(`password-${selectedRole}`) as HTMLInputElement).value;

  console.log("Email entered:", email);
  console.log("Password entered:", password ? "••••••••" : "(empty)");

  try {
    console.log("🔹 Sending request to server...");

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: selectedRole }),
    });

    console.log("🔹 Server responded with status:", res.status);

    let data;
    try {
      data = await res.json();
      console.log("🔹 Response JSON:", data);
    } catch (err) {
      console.log("❌ Failed to parse JSON response");
    }

    if (!res.ok) {
      console.log("❌ Login failed:", data?.message);
      toast({
        title: "Login Failed",
        description: data?.message || "Unknown error",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Login success. Token received:", data.token);

    localStorage.setItem("token", data.token);

    toast({
      title: "Login Successful",
      description: `Logged in as ${selectedRole}`,
    });

    // Redirect based on role  
    console.log("🔹 Redirecting user to dashboard...");

    setTimeout(() => {
      if (selectedRole === "customer") navigate("/dashboard");
      else if (selectedRole === "mechanic") navigate("/mechanic/dashboard");
      else if (selectedRole === "manager") navigate("/manager/dashboard");
      else if (selectedRole === "admin") navigate("/admin/dashboard");
    }, 500);

  } catch (error) {
    console.log("❌ ERROR in login request:", error);
    toast({
      title: "Error",
      description: "Something went wrong!",
      variant: "destructive",
    });
  }
};

  const roleIcons = {
    customer: User,
    mechanic: Wrench,
    manager: Settings,
    admin: ShieldCheck,
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-0 right-0 w-1/2 h-full">
        <div className="absolute inset-0 bg-gradient-to-l from-primary/10 via-transparent to-transparent" />
      </div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-border/100 shadow-2xl relative z-10">
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
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your SVMMS account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={role} onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
              {(["customer", "mechanic", "manager", "admin"] as const).map((roleType) => {
                const Icon = roleIcons[roleType];
                return (
                  <TabsTrigger 
                    key={roleType} 
                    value={roleType}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs flex flex-col"
                  >
                    <Icon className="h-3 w-3"  />
                    <span className="capitalize">{roleType}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(["customer", "mechanic", "manager", "admin"] as const).map((roleType) => (
              <TabsContent key={roleType} value={roleType} className="mt-6">
                <form onSubmit={(e) => handleLogin(e, roleType)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor={`email-${roleType}`} className="text-foreground">Email</Label>
                    <Input
                      id={`email-${roleType}`}
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`password-${roleType}`} className="text-foreground">Password</Label>
                    <Input
                      id={`password-${roleType}`}
                      type="password"
                      placeholder="••••••••"
                      required
                      className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Link to="/forgot-password" className="text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold glow-primary hover:scale-[1.02] transition-transform">
                    Sign In as {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{" "}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default Login;
