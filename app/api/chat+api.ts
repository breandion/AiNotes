export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    // Simple AI response logic - in a real app, you'd integrate with OpenAI, Claude, etc.
    const responses = [
      "I can help you create a new note! What topic would you like to write about?",
      "Let me suggest organizing your notes into folders by subject or project.",
      "I can help you improve your note content. What specific area would you like to focus on?",
      "Would you like me to help you create a structured outline for your notes?",
      "I can assist with formatting your notes for better readability.",
      "Let's create a new folder to keep your notes organized. What would you like to call it?",
    ];

    // Simple keyword-based responses
    let response = "";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('create') || lowerMessage.includes('new')) {
      if (lowerMessage.includes('note')) {
        response = "I'd be happy to help you create a new note! What would you like to write about? I can help you with:\n\n• Structuring your content\n• Adding headings and sections\n• Organizing your thoughts\n• Creating lists and outlines";
      } else if (lowerMessage.includes('folder')) {
        response = "Let's create a new folder! Here are some popular folder organization ideas:\n\n• By project or subject\n• By priority (urgent, important, later)\n• By type (ideas, tasks, references)\n• By date or timeframe\n\nWhat type of folder would work best for you?";
      } else {
        response = "I can help you create notes, folders, or organize your content. What would you like to create?";
      }
    } else if (lowerMessage.includes('organize') || lowerMessage.includes('structure')) {
      response = "Great! Here are some ways I can help organize your notes:\n\n• Create topic-based folders\n• Add tags and categories\n• Structure content with headings\n• Create templates for common note types\n• Set up a consistent naming system\n\nWhat aspect would you like to focus on?";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      response = "I'm here to help with your notes! I can assist you with:\n\n📝 Creating and editing notes\n📁 Organizing folders\n✨ Improving content structure\n🔍 Finding and searching notes\n💡 Generating ideas and outlines\n\nWhat would you like help with?";
    } else {
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return Response.json({ response });
  } catch (error) {
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}