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
1. **Semantic Search**: Uses OpenAI embeddings to find relevant biblical content
2. **Knowledge Base**: Contains 25+ curated items (proverbs, scripture, teachings, prayer guidance)
3. **Context Enhancement**: Injects retrieved wisdom into AI responses
4. **Scripture References**: Automatically includes biblical references

### Knowledge Categories
- **Proverbs**: Wisdom sayings from the Book of Proverbs
- **Scripture**: Key Bible verses and teachings
- **Teachings**: Core Christian doctrines
- **Prayer**: Prayer guidance and examples
- **Guidance**: Life guidance and spiritual direction

## Future Features To Work On

- Import pictures for the AI model to analyze and give a response, more specifically in the context of uploading a bible verse
- UI features (dark/light mode, customization, responsiveness)
- Vector database integration for better performance
