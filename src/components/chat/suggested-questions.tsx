"use client"

import { Button } from "@/components/ui/button"

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void
}

const questions = [
  "How do tax brackets work?",
  "What deductions am I eligible for?",
  "Explain standard vs. itemized deductions",
  "What's the difference between W-2 and 1099?",
]

export default function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500 mb-2">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100"
            onClick={() => onQuestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}

