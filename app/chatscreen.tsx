import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, MessageSquare, Send, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    ListRenderItem,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// --- (ACTION REQUIRED) ADD YOUR API KEY HERE ---
// Get your key from Google AI Studio
const YOUR_GEMINI_API_KEY = "AIzaSyBd9wwZmS-dmpqaqk6pQoQEakbD2QoLdic"; // PASTE YOUR KEY HERE
// ---------------------------------------------

// --- Type Definitions ---
interface Source {
  uri: string;
  title: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  sources: Source[];
}

// --- Simplified English Translations ---
const t = {
  title: "AI Assistant",
  subtitle: "Your Farming Companion",
  placeholder: "Ask about crops, soil, or schemes...",
  typing: "AI Assistant is typing...",
  sources: "Sources:",
  welcome: "Hello! I am your AI assistant. How can I help you with agriculture today?",
  error: "Sorry, I couldn't fetch a response. Please check your connection and try again.",
};

// --- Bot Message Component (Restyled) ---
interface BotMessageProps {
  text: string | null;
  sources: Source[];
}
const BotMessage: React.FC<BotMessageProps> = ({ text, sources }) => (
  <View style={styles.messageRow}>
    <View style={styles.botIconContainer}>
      <MessageSquare color="#FFFFFF" size={20} />
    </View>
    <View style={styles.botMessageBox}>
      {text ? (
        <Text style={styles.messageText}>{text}</Text>
      ) : (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color="#555" />
          <Text style={styles.typingText}>{t.typing}</Text>
        </View>
      )}
      {sources && sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesTitle}>{t.sources}</Text>
          {sources.map((source, index) => (
            <Pressable key={index} onPress={() => source.uri && Linking.openURL(source.uri)}>
              <Text style={styles.sourceLink}>
                {index + 1}. {source.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  </View>
);

// --- User Message Component (Restyled) ---
interface UserMessageProps {
  text: string;
}
const UserMessage: React.FC<UserMessageProps> = ({ text }) => (
  <View style={[styles.messageRow, { justifyContent: 'flex-end' }]}>
    <View style={styles.userMessageBox}>
      <Text style={styles.userMessageText}>{text}</Text>
    </View>
    <View style={styles.userIconContainer}>
      <User color="#333" size={20} />
    </View>
  </View>
);

// --- System Prompt (Simplified) ---
const getSystemPrompt = () => {
  const languageName = "English";
  const topicInstruction = "Your ONLY purpose is to provide information about Indian agriculture, including crops, soil health, pest control, cattle health, and government schemes like PM-KISAN.";

  return `You are 'AgroTech AI', an expert AI assistant for Indian farmers. ${topicInstruction}
  
  IMPORTANT: If the user asks any question NOT related to your designated purpose, you MUST politely decline. State that you can only answer questions about agriculture.
  
  CRITICAL: You MUST respond in ${languageName}. Your entire response must be in ${languageName} only, regardless of the user's input language.
  
  Be friendly, respectful, and use simple terms. Structure your answers with headings and bullet points for clarity.`;
};


export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!YOUR_GEMINI_API_KEY) {
      Alert.alert(
        "API Key Missing",
        "Please add your Gemini API key to `app/chatscreen.tsx` to enable the chat."
      );
    }
    setMessages([
      {
        id: Date.now(),
        text: t.welcome,
        sender: 'bot',
        sources: [],
      },
    ]);
  }, []);

  const callGenerativeApi = async (
    prompt: string,
  ): Promise<{ text: string; sources: Source[] }> => {
    
    if (!YOUR_GEMINI_API_KEY) {
      throw new Error("API Key is missing.");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${YOUR_GEMINI_API_KEY}`;
    const systemPrompt = getSystemPrompt();

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ "googleSearch": {} }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    // Add exponential backoff for retries
    let response;
    let retries = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    while (retries < maxRetries) {
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          break; // Success
        }

        if (response.status === 429 || response.status >= 500) {
          // Throttling or server error, wait and retry
          const delay = baseDelay * Math.pow(2, retries);
          console.warn(`API call failed with status ${response.status}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          // Other client-side error (e.g., 400 Bad Request)
          throw new Error(`API call failed with status ${response.status}`);
        }

      } catch (e) {
        if (retries >= maxRetries - 1) {
          throw e; // Throw error after last retry
        }
        const delay = baseDelay * Math.pow(2, retries);
        console.warn(`API call failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      }
    }

    if (!response || !response.ok) {
      throw new Error('API call failed after retries');
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];

    if (!candidate || !candidate.content?.parts) {
      // Handle cases where the API returns a safety block or no content
      if (result.promptFeedback?.blockReason) {
        console.error("API call blocked:", result.promptFeedback.blockReason);
        return { text: "I'm sorry, I can't respond to that request due to safety guidelines.", sources: [] };
      }
      throw new Error('Invalid response structure from API.');
    }

    const textPart = candidate.content.parts.find((part: any) => part.text);
    const text: string = textPart ? textPart.text : "I found some information, but couldn't generate a summary.";

    const toolPart = candidate.content.parts.find((part: any) => part.toolCall || part.googleSearch);
    let sources: Source[] = [];
    if (toolPart?.googleSearch?.results) {
        sources = toolPart.googleSearch.results.map((res: any) => ({
          uri: res.uri,
          title: res.title,
        })).filter((source: Partial<Source>): source is Source => !!source.uri && !!source.title);
    }
    
    return { text, sources };
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: userInput,
      sender: 'user',
      sources: [],
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await callGenerativeApi(userInput);
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text,
        sender: 'bot',
        sources,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: t.error,
        sender: 'bot',
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    if (item.sender === 'user') {
      return <UserMessage text={item.text} />;
    }
    return <BotMessage text={item.text} sources={item.sources} />;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#333" size={28} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );

  return (
    <LinearGradient
      colors={["#FDFDFB", "#F5F8F5"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjusted offset
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            ListFooterComponent={
              isLoading ? <BotMessage text={null} sources={[]} /> : null
            }
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={styles.footer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={userInput}
                onChangeText={setUserInput}
                placeholder={t.placeholder}
                placeholderTextColor="#9CA3AF"
                editable={!isLoading}
                multiline
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                style={[
                  styles.sendButton,
                  (isLoading || !userInput.trim()) && styles.disabledButton,
                ]}
              >
                <Send color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  botIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#2E7D32", // App theme color
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  botMessageBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderTopLeftRadius: 0,
    padding: 12,
    maxWidth: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  messageText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageBox: {
    backgroundColor: '#E8F5E9', // Light green for user
    borderRadius: 16,
    borderTopRightRadius: 0,
    padding: 12,
    maxWidth: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userMessageText: {
    color: '#333', // Dark text
    fontSize: 15,
    lineHeight: 22,
  },
  userIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  typingText: {
    color: '#555',
    fontSize: 14,
    fontStyle: 'italic',
  },
  sourcesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sourcesTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sourceLink: {
    fontSize: 13,
    color: '#2E7D32', // App theme color
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 22,
    fontSize: 15,
    backgroundColor: '#F8F9FA',
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#2E7D32', // App theme color
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7', // Lighter green
  },
});

