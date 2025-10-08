import React from 'react';
import { Bubble, BubbleProps } from 'react-native-gifted-chat';

export default function ChatBubble(props: BubbleProps<any>) {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: 4,
          borderWidth: 1,
          borderColor: '#d3e0ea',
        },
        right: {
          backgroundColor: '#6c63ff',
          borderRadius: 16,
          padding: 4,
        },
      }}
      textStyle={{
        left: {
          color: '#333',
          fontSize: 15,
        },
        right: {
          color: '#fff',
          fontSize: 15,
        },
      }}
    />
  );
}
