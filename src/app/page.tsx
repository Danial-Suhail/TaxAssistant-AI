
"use client"

import React from 'react'
import { Card } from "@/components/ui/card"
import { Send, Loader2, Calculator, LineChart, FileText, BarChart } from "lucide-react"
import Chatbot from "@/components/chat-box"

const SuggestedPrompts = [
  {
    icon: <Calculator className="h-5 w-5" />,
    text: "Generate the monthly income statement"
  },
  {
    icon: <LineChart className="h-5 w-5" />,
    text: "Provide a 12-month cash flow forecast"
  },
  {
    icon: <FileText className="h-5 w-5" />,
    text: "Book a journal entry"
  },
  {
    icon: <BarChart className="h-5 w-5" />,
    text: "Create a real-time financial dashboard"
  }
]

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-teal-50 to-white">
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700 mb-2">TaxAssist AI</h1>
          <p className="text-gray-600 text-center max-w-md">
            Your AI tax assistant. Ask questions about Form 1040, deductions, and more.
          </p>
        </div>

        <Card className="w-full px-3 pb-3 shadow-lg mb-10 bg-white">
          <div className="h-[70vh] overflow-y-auto ">
            <Chatbot />
          </div>
        </Card>
      </div>
    </main>
  )
}

