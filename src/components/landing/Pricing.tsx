import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying it out",
    price: "$0",
    period: "",
    features: [
      "1 project per semester",
      "Up to 20 students",
      "Google Docs + Zoom tracking",
      "Basic analytics",
    ],
    cta: "Sign Up Now",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious educators",
    price: "$150",
    period: "per semester",
    features: [
      "Unlimited projects",
      "Unlimited students",
      "All platforms (GitHub, Slack, etc.)",
      "Advanced analytics",
      "PDF dispute reports",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "University",
    description: "Department-wide access",
    price: "Custom",
    period: "",
    features: [
      "Unlimited teachers",
      "SSO integration",
      "LMS integration (Canvas, etc.)",
      "On-campus training",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 antialiased">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core tracking features.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-primary text-white scale-105 shadow-2xl shadow-primary/20"
                  : "bg-white border border-slate-200 hover:border-primary/30 shadow-lg hover:shadow-xl"
              } transition-all duration-300`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-white text-primary font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan info */}
              <div className="mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={plan.popular ? "text-white/80" : "text-slate-500"}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm ml-2 ${plan.popular ? "text-white/80" : "text-slate-500"}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-white/20" : "bg-blue-50"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-white" : "text-primary"}`} />
                    </div>
                    <span className={`text-sm ${plan.popular ? "text-white/90" : "text-slate-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/auth"
                className={`block w-full py-3 text-center font-semibold rounded-lg transition-all duration-200 hover:scale-105 ${
                  plan.popular
                    ? "bg-white text-primary hover:shadow-lg hover:shadow-white/20"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
