import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  Play,
  Shield,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg glow-primary">
              <Wrench className="h-7 w-7 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">SVMMS</span>
          </div>
          {/* 
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
          </nav> */}
          <div className="flex gap-3">
            <Link to="/login">
              <Button
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="gradient-primary text-primary-foreground font-semibold glow-primary">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden min-h-screen">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/20 via-primary/5 to-transparent" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        {/* Diagonal Accent Lines */}
        <div className="absolute bottom-10 right-10 flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-16 bg-primary rounded-sm transform rotate-12"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>               

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center h-full">
          <div className="max-w-4xl text-center">
            {/* Line 1   */}
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              SMART VEHICLE MAINTENANCE
            </h1>
            {/* Line 2  */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-3">
              AND SERVICE MANAGEMENT SYSTEM
            </h1>
            {/* Line 3 */}
            <h1 className="text-gradient text-5xl md:text-7xl font-extrabold mt-6">
              SVMMS
            </h1>{" "}
            <br />
            <p className="text-xl text-muted-foreground mb-8 max-w-xl text-center mx-auto">
              Find Your Perfect Service Today. Complete maintenance and repair
              management for modern automotive workshops.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground font-semibold text-lg px-8 glow-primary hover:scale-105 transition-transform"
                >
                  Book Service Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8"
                >
                  <Play className="mr-2 h-5 w-5 text-primary" />
                  Dashboard Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 diagonal-stripe opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="text-primary">SVMMS?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Industry-leading features designed for modern automotive service
              management
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Car,
                title: "Vehicle Management",
                desc: "Track all your vehicles and complete service history in one unified platform",
              },
              {
                icon: Calendar,
                title: "Smart Booking",
                desc: "Schedule services online with intelligent slot management and instant confirmation",
              },
              {
                icon: Wrench,
                title: "Expert Mechanics",
                desc: "Certified professionals with years of experience and specialized training",
              },
              {
                icon: Clock,
                title: "Real-time Updates",
                desc: "Get instant notifications at every step of your vehicle service journey",
              },
              {
                icon: Shield,
                title: "Quality Assured",
                desc: "All services backed by comprehensive warranty and quality certifications",
              },
              {
                icon: Award,
                title: "Trusted Service",
                desc: "Rated 4.9/5 by thousands of satisfied customers worldwide",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="bg-card/50 bg-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group backdrop-blur-sm"
              >
                <CardContent className="pt-8 pb-8">
                  <div className="p-4 bg-primary/10 rounded-xl w-fit mb-5 group-hover:bg-primary/20 transition-colors group-hover:glow-primary">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 border-y bg-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Vehicles Serviced" },
              { value: "98%", label: "Customer Satisfaction" },
              { value: "50+", label: "Expert Mechanics" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of satisfied customers managing their vehicle
            maintenance with the most trusted platform
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-background text-primary hover:bg-background/90 text-lg px-10 font-semibold shadow-xl hover:scale-105 transition-transform"
            >
              Create Free Account
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/10 py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold">SVMMS</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 SVMMS. All rights reserved. Premium Vehicle Service
              Management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
