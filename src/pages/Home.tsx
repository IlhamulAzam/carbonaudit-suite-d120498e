import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CarboLogo } from "@/components/CarboLogo";
import { TypingEffect } from "@/components/TypingEffect";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Shield, Zap, FileCheck } from "lucide-react";

const features = [
  {
    icon: FileCheck,
    title: "JCM Compliance",
    description: "Validate against JCM_PH_AM004 methodology standards",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get comprehensive pre-audit results in minutes",
  },
  {
    icon: Shield,
    title: "Risk Detection",
    description: "Identify major and minor issues before official verification",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <CarboLogo size="lg" animate />
          </motion.div>

          <div className="h-8 mb-12">
            <TypingEffect
              text="Making carbon crediting accessible"
              delay={800}
              speed={60}
              className="text-xl text-muted-foreground"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <Button asChild size="lg" className="shadow-soft">
              <Link to="/evaluate">
                Start Pre-Audit
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-soft border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <feature.icon className="text-accent-foreground" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold mb-4">
              Ready to validate your carbon credit project?
            </h2>
            <p className="text-muted-foreground mb-8">
              Upload your PDD and calculation spreadsheet to receive a comprehensive
              pre-audit report before official verification.
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Create Free Account</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto flex items-center justify-between">
          <CarboLogo size="sm" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CarboAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
