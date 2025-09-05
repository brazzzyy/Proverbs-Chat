## Project Overview

Proverbs Chat is a Christian AI chatbot built using Next.js and OpenAI's GPT-4o-mini model. The chatbot provides empathetic, biblically grounded responses to questions about Christianity, faith, and life. It's designed to offer concise and conversational answers to help the person understand more about any topics towards Christianity or gain insight on wisdom overall

## See The Project

Visit: https://proverbs-chat.vercel.app/ to see the project in action!

## Tech Stack

- **Frontend**: Next.js, Tailwind
- **Backend**: Next.js API Routes, Typescript
- **Database**: Supabase
- **AI Integration**: OpenAI SDK

## RAG Pipeline

The app has a RAG pipeline that retrieves relevant biblical content to strengthen AI responses:

### How It Works
The RAG system works by using OpenAI's embedding technology to understand the meaning behind user questions and find the most relevant biblical content from the knowledge base. When someone asks a question, the system searches through over 25 topics of proverbs, scriptures, teachings, and guidance materials to find content that truly relates to what the user is asking about. This relevant wisdom is then augmented into the AI's response

The knowledge base covers everything from Solomon's proverbs and key Bible verses to practical teachings about Christian life, prayer guidance, and spiritual direction. It's like having a wise biblical counselor who can instantly find the appropiate verse or teaching for any situation

## Future Features To Work On

- Import pictures for the AI model to analyze and give a response, more specifically in the context of uploading a bible verse
- UI features (dark/light mode, customization, responsiveness)
- Vector database integration for better performance
