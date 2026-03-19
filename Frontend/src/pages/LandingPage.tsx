import { Link } from "react-router-dom";
import chronosLogo from "@/assets/chronos-logo-horizontal.png";
import heroDashboard from "@/assets/hero-dashboard.png";
import iconPredict from "@/assets/icon-predict.png";
import iconAi from "@/assets/icon-ai.png";
import iconCare from "@/assets/icon-care.png";
import { Activity, Bell, BarChart3, Shield, Zap } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-landing text-sidebar-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-landing-bg/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <img src={chronosLogo} alt="Chronos ICU" className="h-8" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#home" className="text-primary">Home</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#technology" className="hover:text-primary transition-colors">Technology</a>
            <a href="#about" className="hover:text-primary transition-colors">About Us</a>
          </div>
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-semibold border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-6">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              AI Early Warning{" "}
              <span className="text-gradient-brand">System for ICUs</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Predicting critical events 2–6 hours in advance, saving lives before alarms trigger.
            </p>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-7 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
              <a
                href="#features"
                className="px-7 py-3 border border-sidebar-border text-sidebar-foreground font-semibold rounded-md hover:border-primary/50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-3xl" />
            <img
              src={heroDashboard}
              alt="Chronos ICU Dashboard"
              className="relative rounded-xl glow-border animate-float"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            Transforming ICU Care with <span className="text-gradient-brand">Proactive AI</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: iconPredict,
                title: "Predict ICU Crashes",
                desc: "Forecasts critical events like septic shock, cardiac arrest, and hemodynamic collapse up to 6 hours in advance.",
              },
              {
                icon: iconAi,
                title: "Explainable AI",
                desc: "Clear SHAP insights show precisely which vitals are driving the risk score, building trust.",
              },
              {
                icon: iconCare,
                title: "Proactive Care",
                desc: "Reduces alarm fatigue with actionable, colour-coded warnings before emergencies.",
              },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-8 glow-border hover:border-primary/30 transition-all">
                <img src={f.icon} alt={f.title} className="w-14 h-14 mb-5" />
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="technology" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Get Started Today</h2>
          <p className="text-center text-muted-foreground mb-12">Proven results on real ICU data</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Activity, stat: "87%", label: "Prevents Crashes", desc: "Predicts cardiac arrest, septic shock, hemodynamic collapse ahead" },
              { icon: Bell, stat: "60%", label: "Reduces Alarm Fatigue", desc: "Cuts noise by 60% with clear, color-coded alerts" },
              { icon: BarChart3, stat: "92%", label: "Validated AI-ML Model", desc: "Tested on MIMIC-III (40,000+ ICU patients)" },
              { icon: Shield, stat: "HL7", label: "EHR Integration", desc: "EHR ready via HL7/FHIR standards" },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-6 text-center glow-border">
                <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-gradient-brand mb-1">{s.stat}</div>
                <div className="font-semibold text-sm mb-2">{s.label}</div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <img src={chronosLogo} alt="Chronos ICU" className="h-12 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">See Chronos ICU in Action</h2>
          <p className="text-muted-foreground mb-8">Request a demo and start predicting ICU crashes before they happen.</p>
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md bg-landing-surface border border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Link
              to="/login"
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sidebar-border py-8 px-6">
        <div className="container mx-auto text-center text-xs text-muted-foreground">
          © 2026 Chronos ICU — Team Pixel Pioneer. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
