## Project Overview

Proverbs Chat is a Christian AI chatbot built using Next.js and OpenAI's GPT-4o-mini model. It provides empathetic, biblically grounded responses to questions about Christianity, faith, and life. The chatbot is designed to offer concise and conversational answers while maintaining a warm and respectful tone.

## See The Project

Visit: https://proverbs-chat.vercel.app/ to see the project in action!

## Project Folder Structure

```
proverbs-chat/
├── public/                 # Static assets (images, fonts, etc.)
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   └── chat/           # Chat API route
│   │       └── route.ts 
│   ├── ui/                 # UI components (e.g., nav, chat)
│   │    ├── chat.tsx
│   │    └── nav.tsx 
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
├── README.md               # Project documentation
├── package.json            # Project dependencies and scripts
├── next.config.js          # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Tech Stack

- **Frontend**: Next.js, Tailwind
- **Backend**: Next.js API Routes, Typescript
- **AI Integration**: OpenAI SDK

## Features

- **Christian AI Chatbot**: Provides biblically grounded wisdom in a conversational tone.
- **Empathetic Responses**: Designed to sound warm and human-like, avoiding robotic or overly formal language.
- **Scripture Integration**: Uses Bible verses selectively to strengthen responses.

## Future Features To Work On

- Import pictures for the AI model to analyze and give a response, more specifically in the context of uploading a bible verse
- Integrate PostgreSQL database to store all responses to view history of chat messages
- UI features (dark/light mode, customization, responsiveness)
