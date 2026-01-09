"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BenefitsSection from "@/components/home/benefits";
import { useRouter } from "next/navigation";
import HeroBackground from "@/components/home/hero-backgorund";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col   bg-gray-50 dark:bg-[#040820] dark:text-white">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-[#f3f6fb] bg-gradient-to-t from-blue-100 from-50% to-gray-50 relative overflow-hidden">
          <HeroBackground />
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Detect Code Smells & Refactor with Confidence
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Code Doctor analyzes your codebase to detect code smells and
                    provides intelligent refactoring suggestions, improving code
                    reliability, maintainability, and security.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href={"/login"}
                    className="bg-[#126ed3] hover:bg-blue-700 text-white cursor-pointer border-md text-base w-auto px-4 py-2 rounded-md flex items-center justify-center font-medium transition"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-gradient-to-b from-blue-50 to-white p-4 shadow-xl dark:bg-[#040820]">
                  <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(to_bottom,white,transparent)] dark:bg-[#0F172A] dark:[mask-image:linear-gradient(to_bottom,#040820,#3a4255)]" />
                  <div className="relative h-full w-full overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-[#0F172A]">
                    <div className="flex h-10 items-center border-b bg-gray-50 px-4 dark:bg-[#040820]">
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-400" />
                        <div className="h-3 w-3 rounded-full bg-yellow-400" />
                        <div className="h-3 w-3 rounded-full bg-green-400" />
                      </div>
                      <div className="ml-4 text-sm font-medium ">
                        CodeScent Analysis
                      </div>
                    </div>
                    <div className="p-4 font-mono text-sm dark:bg-[#040820]">
                      <motion.div
                        className="mb-2 text-blue-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        {"// Code smell detected: Long Method"}
                      </motion.div>
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                      >
                        <span className="text-gray-500">function</span>{" "}
                        <span className="text-blue-600">processData</span>(data){" "}
                        {"{"}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-gray-500">
                          {"   // This method is too long (50+ lines)"}
                        </span>
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-gray-500">
                          {
                            "  // Consider breaking it down into smaller functions"
                          }
                        </span>
                        <br />
                        {"}"}
                      </motion.div>
                      <motion.div
                        className="mb-2 text-green-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
                      >
                        {"    // Suggested refactoring:"}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 1.1 }}
                      >
                        <span className="text-gray-500">function</span>{" "}
                        <span className="text-blue-600">processData</span>(data){" "}
                        {"{"}
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-blue-600">validateInput</span>
                        (data);
                        <br />
                        &nbsp;&nbsp;<span className="text-gray-500">
                          const
                        </span>{" "}
                        processed ={" "}
                        <span className="text-blue-600">transformData</span>
                        (data);
                        <br />
                        &nbsp;&nbsp;
                        <span className="text-gray-500">return</span>{" "}
                        <span className="text-blue-600">formatOutput</span>
                        (processed);
                        <br />
                        {"}"}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        <BenefitsSection />
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              className="grid gap-6 lg:grid-cols-2 lg:gap-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-blue-100 dark:bg-[#126ed3] dark:text-white px-3 py-1 text-sm text-blue-600">
                    Real-time Analysis
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Improve Code Quality in Real-Time
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    CodeScent analyzes your code as you write, providing
                    immediate feedback and suggestions for improvement.
                  </p>
                </div>
                <ul className="grid gap-2">
                  <motion.li
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>Instant feedback on code quality</span>
                  </motion.li>
                  <motion.li
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>Detailed explanations of detected issues</span>
                  </motion.li>
                  <motion.li
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>One-click refactoring suggestions</span>
                  </motion.li>
                  <motion.li
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>
                      Educational resources to improve coding practices
                    </span>
                  </motion.li>
                </ul>
                <div>
                  <Button
                    className="bg-primary hover:bg-blue-700 dark:text-white"
                    onClick={() => router.push("/login")}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="relative h-[400px] w-full overflow-hidden rounded-xl border bg-white p-4 shadow-xl dark:bg-[#0F172A]">
                  <div className="flex h-10 items-center border-b bg-gray-50 px-4 dark:bg-[#0F172A]">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="ml-4 text-sm font-medium">
                      Real-time Analysis
                    </div>
                  </div>
                  <div className="p-4 font-mono text-sm dark:bg-[#0F172A]">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                      <span>Code quality score: 85/100</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <motion.div
                        className="rounded-md bg-yellow-50 p-2 text-yellow-800 dark:bg-[#040820]"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <span className="font-bold">Warning:</span> Duplicate
                        code detected in utils/helpers.js
                      </motion.div>
                      <motion.div
                        className="rounded-md bg-red-50 p-2 text-red-800 dark:bg-[#040820]"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                        viewport={{ once: true }}
                      >
                        <span className="font-bold">Critical:</span> Memory leak
                        in components/Modal.jsx
                      </motion.div>
                      <motion.div
                        className="rounded-md bg-blue-50 p-2 text-blue-800 dark:bg-[#040820]"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
                        viewport={{ once: true }}
                      >
                        <span className="font-bold">Suggestion:</span> Extract
                        method from UserService.processPayment()
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
