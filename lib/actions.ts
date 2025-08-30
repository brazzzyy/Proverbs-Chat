import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: require});

// Access previous AI chat histories functionality
export async function fetchChatHistory() {
    
}