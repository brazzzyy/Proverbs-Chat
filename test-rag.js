// Simple test script for RAG functionality
// Run with: node test-rag.js

const testQueries = [
  "How can I find peace in difficult times?",
  "What does the Bible say about forgiveness?",
  "How should I pray?",
  "What is the meaning of love?",
  "How can I trust God more?",
  "What does wisdom mean?",
  "How do I handle anxiety?",
  "What is faith?",
  "How can I be more patient?",
  "What does it mean to follow Jesus?"
];

async function testRAG() {
  console.log('🧪 Testing RAG Pipeline...\n');
  
  // Test each query
  for (const query of testQueries) {
    console.log(`📝 Query: "${query}"`);
    
    try {
      // Simulate API call to RAG endpoint
      const response = await fetch('http://localhost:3000/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search',
          data: { query }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Found ${result.references.length} references`);
        console.log(`📚 Categories: ${result.categories.join(', ')}`);
        console.log(`💭 Context preview: ${result.context.substring(0, 100)}...`);
      } else {
        console.log(`❌ Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
    
    console.log('---\n');
  }
  
  console.log('🎉 RAG testing completed!');
}

// Run the test
testRAG().catch(console.error);
