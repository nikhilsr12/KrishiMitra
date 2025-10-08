// import React, { useState, useCallback, useEffect } from 'react';
// import { GiftedChat, IMessage, Bubble, InputToolbar, BubbleProps } from 'react-native-gifted-chat';
// import { View } from 'react-native';
// import axios from 'axios';
// import ChatBubble from './chatbubble';
// import MessageInput from './messageinput';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState<IMessage[]>([]);
//   const [isTyping, setIsTyping] = useState(false);

//   useEffect(() => {
//     setMessages([
//       {
//         _id: 1,
//         text: 'Hi! I am Veloria AI 🤖. How can I help you today?',
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: 'Veloria Bot',
//         },
//       },
//     ]);
//   }, []);

//   const onSend = useCallback(async (newMessages: IMessage[] = []) => {
//     const userMessage = newMessages[0];
//     setMessages(prev => GiftedChat.append(prev, [userMessage]));
//     setIsTyping(true);

//     try {
//       const response = await axios.post(
//         'http://192.168.1.42:8000/api/chat/',
//         { message: userMessage.text },
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       const replyText = response?.data?.reply?.trim() || '🤖 Sorry, I did not understand that.';
//       const botMessage: IMessage = {
//         _id: Math.random().toString(),
//         text: replyText,
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: 'Veloria Bot',
//         },
//       };

//       setMessages(prev => GiftedChat.append(prev, [botMessage]));
//     } catch (error) {
//       setMessages(prev =>
//         GiftedChat.append(prev, [
//           {
//             _id: Math.random().toString(),
//             text: '⚠️ Sorry, there was a problem reaching the AI.',
//             createdAt: new Date(),
//             user: {
//               _id: 2,
//               name: 'Veloria Bot',
//             },
//           },
//         ])
//       );
//     } finally {
//       setIsTyping(false);
//     }
//   }, []);

//   return (
//     <View style={{ flex: 1, backgroundColor: '#f2f6fc' }}>
//       <GiftedChat
//         messages={messages}
//         onSend={messages => onSend(messages)}
//         user={{ _id: 1 }}
//         isTyping={isTyping}
//         placeholder="Ask Veloria anything..."
//         renderBubble={(props: BubbleProps<IMessage>) => <ChatBubble {...props} />}
//         renderInputToolbar={() => <MessageInput onSend={onSend} />}
//         renderAvatar={null}
//         showUserAvatar={false}
//       />
//     </View>
//   );
// }
import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, BubbleProps } from 'react-native-gifted-chat';
import { View, Alert } from 'react-native';
import axios from 'axios';
import ChatBubble from '../../app/chatbubble';
import MessageInput from '../../app/messageinput';

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hi! I am Veloria AI 🤖. How can I help you today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Veloria Bot',
        },
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages(prev => GiftedChat.append(prev, [userMessage]));
    setIsTyping(true);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/chat/',
        { message: userMessage.text },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('API RESPONSE:', response.data); // 💬 See what's returned

      const replyText = response?.data?.reply?.trim() || '🤖 Sorry, I did not understand that.';
      const botMessage: IMessage = {
        _id: Math.random().toString(),
        text: replyText,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Veloria Bot',
        },
      };

      setMessages(prev => GiftedChat.append(prev, [botMessage]));
    } catch (error: any) {
      console.error('API ERROR:', error.message);
      Alert.alert('Error', '⚠️ Could not fetch response from server.');
      setMessages(prev =>
        GiftedChat.append(prev, [
          {
            _id: Math.random().toString(),
            text: '⚠️ Sorry, there was a problem reaching the AI.',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'Veloria Bot',
            },
          },
        ])
      );
    } finally {
      setIsTyping(false);
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f6fc' }}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: 1 }}
        isTyping={isTyping}
        placeholder="Ask Veloria anything..."
        renderBubble={(props: BubbleProps<IMessage>) => <ChatBubble {...props} />}
        renderInputToolbar={() => <MessageInput onSend={onSend} />}
        renderAvatar={null}
        showUserAvatar={false}
      />
    </View>
  );
}
