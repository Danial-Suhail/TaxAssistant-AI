# TaxAssist AI
Your AI tax assistant. Ask questions about Form 1040, deductions, and more.
## 💻 Tech Stack
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](#) [![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#) [![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#) [![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#) [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000?logo=shadcnui&logoColor=fff)](#) [![Vercel](https://img.shields.io/badge/Vercel-%23000000.svg?logo=vercel&logoColor=white)](#) [![Framer](https://img.shields.io/badge/Framer-05F?logo=framer&logoColor=fff)](#) [![ChatGPT](https://img.shields.io/badge/ChatGPT-74aa9c?logo=openai&logoColor=white)](#)

## ✨ Features
- ### AI-Powered Tax Chatbot
   - Uses Vercel AI SDK (useChat hook) to provide real-time, interactive tax-related Q&A with streaming responses and quick-reply suggestions.

- ### File Upload & Processing
   - Enables users to upload tax documents (e.g., W-2 PDFs) within the chat, simulating basic file analysis and referencing uploaded files in responses.

- ### Enhanced UX with Multimedia
   - Implements Tailwind CSS for a clean UI, supports multimedia elements like tables/charts for tax breakdowns, and optimizes state management with TanStack Query.

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Danial-Suhail/TaxAssistant-AI.git
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Include Environment Variables (.env) for (gemini, GPT, deepseek, grok, etc.) secret keys under the main directory.

2. Install NPM packages:

```bash
npm install
# or
npm i
```
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=""
   OPENAI_API_KEY=""
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
