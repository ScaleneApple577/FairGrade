import { motion } from "framer-motion";
import { FileText, Puzzle, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Create Project",
    description:
      "Add project details and student emails. Specify which Google Docs, GitHub repos, or meeting links to track.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Puzzle,
    number: "02",
    title: "Students Install Extension",
    description:
      "One-click install from email invitation. Extension only tracks specified project URLs - not personal browsing.",
    color: "bg-success/10 text-success",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "View Fair Grades",
    description:
      "See who contributed what. Generate grade reports with timestamped evidence.",
    color: "bg-warning/10 text-warning",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Setup in Minutes, Not Hours
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get your entire class tracked with just three simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Connecting line - desktop only */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-success to-warning opacity-20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300 h-full border border-border/50">
                {/* Number badge */}
                <div className="absolute -top-4 left-8">
                  <span className="inline-block bg-gradient-hero text-primary-foreground font-bold text-sm px-4 py-1 rounded-full">
                    Step {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl ${step.color} flex items-center justify-center mb-6 mt-4`}>
                  <step.icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for non-last items */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-card rounded-full shadow-soft flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
