"use client"

import React from 'react'
import { Card } from "@/components/ui/card"
import { Send, Loader2, Calculator, LineChart, FileText, BarChart } from "lucide-react"
import Chatbot from "@/components/chat-box"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  return (
    <>
      <div className="mesh-gradient" />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex min-h-screen flex-col items-center relative"
      >
        <motion.div 
          variants={stagger}
          initial="initial"
          animate="animate"
          className="w-full max-w-4xl px-4 py-8"
        >
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col items-center mb-8"
          >
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-teal-700 mb-2"
            >
              TaxAssist AI
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-gray-600 text-center max-w-md"
            >
              Your AI tax assistant. Ask questions about Form 1040, deductions, and more.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.7,
              delay: 0.3,
              ease: [0.23, 1, 0.32, 1]
            }}
          >
            <Card className="w-full px-3 pb-3 shadow-lg mb-10 glass-effect">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="h-[70vh] overflow-y-auto"
              >
                <Chatbot />
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.main>
    </>
  )
}

