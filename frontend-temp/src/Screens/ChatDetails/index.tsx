import { default as React, useEffect, useState } from 'react';
import { Image, Keyboard, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Composer, GiftedChat, Send, IMessage } from 'react-native-gifted-chat';
import { icn } from '../../Assets/icn';
import { Colors, rgba } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import uuid from 'react-native-uuid';
import DocumentPicker from 'react-native-document-picker';
import Header from '../../Components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
const audioRecorderPlayer = new AudioRecorderPlayer();
import { getChatMessages } from '../../Services/apis/APIs';
import LoadingModal from '../../Components/LoadingModal';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../context/SocketContext';

interface CustomMessageProps {
  currentMessage: IMessage;
}

const CustomMessage: React.FC<CustomMessageProps> = ({ currentMessage }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  function formatTime(isoString: string): any {
    const date = new Date(isoString);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${formattedMinutes} ${ampm}`;
  }

  const togglePlayPause = async () => {
    if (!isPlaying) {
      await audioRecorderPlayer.startPlayer(currentMessage.audio);
      audioRecorderPlayer.addPlayBackListener(e => {
        if (e.currentPosition === e.duration) {
          setIsPlaying(false);
          setIsPaused(false);
        }
      });
      setIsPlaying(true);
    } else if (isPlaying && !isPaused) {
      await audioRecorderPlayer.pausePlayer();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      await audioRecorderPlayer.resumePlayer();
      setIsPaused(false);
    }
  };

  return (
    <View style={[styles.messageContainer]}>
      {currentMessage.message && (
        <View
          style={
            currentMessage.isSend
              ? styles.sentMessage
              : styles.receivedMessage
          }>
          <Text style={styles.messageText}>{currentMessage.message}</Text>
          <Text
            style={{
              alignSelf: 'flex-end',
              marginTop: hp(0.3),
              fontSize: wp(2.8),
            }}>
            {formatTime(currentMessage?.createdAt?.toString())}
          </Text>
        </View>
      )}

      {currentMessage.image && (
        <Image
          source={{ uri: currentMessage.image }}
          style={styles.messageImage}
        />
      )}

      {currentMessage.audio && (
        <TouchableOpacity
          onPress={togglePlayPause}
          style={
            currentMessage.isSend
              ? styles.sentMessage
              : styles.receivedMessage
          }>
          <Text style={styles.audioButtonText}>
            {isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play'} Audio
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface CustomInputToolbarProps {
  text: string;
  onTextChanged: (text: string) => void;
  onSend: (messages: IMessage[]) => void;
}

const CustomInputToolbar: React.FC<CustomInputToolbarProps> = ({ text: any, onTextChanged: any, onSend }: any) => {
  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker?.types?.allFiles],
      });
      const document = res?.[0];
      const message = {
        _id: uuid.v4(),
        text: document.name,
        createdAt: new Date(),
        user: {
          _id: 1,
          name: 'User Name',
        },
        file: document,
      };

      // onSend([message]);
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the document picker');
      } else {
        console.error('Document Picker Error: ', err);
      }
    }
  };
  return (
    <View style={styles.customInputView}>
      <View style={styles.subInputView}>
        <TouchableOpacity style={styles.iconButton || {}} onPress={pickDocument}>
          <Image
            source={icn.clipper}
            style={{ width: wp(5), height: hp(2.5) }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Image
          source={icn.separator}
          style={{ width: wp(5), height: hp(2.5), marginLeft: wp(1) }}
          resizeMode="contain"
        />
        <View style={styles.inputContainer}>
          <Composer
            placeholder="Send message"
            text={text}
            onTextChanged={onTextChanged}
            textInputStyle={styles.composerTxt}
            placeholderTextColor={Colors.black}
            multiline
          />
        </View>
        <Send
          containerStyle={styles.sendBtnContainer}
          alwaysShowSend
          onSend={messages => onSend(messages as IMessage[])}
          text={text}
          label="Send">
          <Image
            resizeMode="contain"
            source={icn.send}
            style={styles.sendIcon}
          />
        </Send>
      </View>
      <TouchableOpacity onPress={() => { }}>
        <Image
          resizeMode="contain"
          source={icn.mic}
          style={styles.microphoneIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const ChatDetails = (): any => {
  const socket = useSocket();
  const route = useRoute();
  const params = route?.params as { item: any };

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();
  const [userId, setUserId] = useState<number | null>(null);
  const [chatPartnerId, setChatPartnerId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getChatMessages({
          chatPartnerId: params?.item?.contactID
        });
        setUserId(response?.data?.userId);
        setChatPartnerId(response?.data?.chatPartnerId);
        console.log('response is here');
        const formattedMessages = response?.data?.data.map((msg: any) => ({
          _id: msg.MessageID || uuid.v4(),
          message: msg.Description,
          isSend: msg.isSend,
          createdAt: new Date(msg.MessageDate),
          user: {
            _id: userId || 0,
            name: msg.isSend ? 'You' : params?.item?.name,
          },
        }));
        setMessages(formattedMessages);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [params?.item?.contactID, userId]);

  // useEffect(() => {
  //   if (socket && userId) {
  //     console.log('join is going to send');
  //     socket.emit('join', userId);
  //   }
  // }, [socket, userId]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (message: any) => {
        console.log('message is received: ', message);
        setMessages((prevMessages: any) => [
          {
            ...message,
            user: {
              _id: userId || 0,
              name: params?.item?.name,
            },
            isSend: 0
          },
          ...prevMessages
        ]);
      });
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage');
      }
    };
  }, [socket, userId]);

  const onSend = (newMessages = []: any): any => {
    if (text.trim() && socket) {
      const message = {
        senderId: userId,
        receiverId: chatPartnerId,
        message: text,
      };

      console.log('MESSAGE ARRAY IS HERE: ', [...messages, {
        ...message,
        createdAt: new Date(),
        user: {
          _id: userId || 0,
          name: params?.item?.name,
        },
      }]);

      socket.emit('sendMessage', message);

      setMessages((previousMessages: any) => [
        {
          _id: uuid.v4(),
          ...message,
          createdAt: new Date(),
          user: {
            _id: userId || 0,
            name: params?.item?.name,
          },
          isSend: 1
        },
        ...previousMessages
      ]);
      setText('');
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      e.preventDefault();
      Keyboard.dismiss();
      setTimeout(() => {
        navigation.dispatch(e?.data?.action);
      }, 30);
    });
    return () => {
      unsubscribe();
    };
  }, [navigation]);

  return (
    <View style={styles.mainView}>
      <View style={[styles.flexRow]}>
        <View style={styles.rowContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={icn.back}
              style={[styles.leftIcn]}
              resizeMode="contain"
              tintColor={'white'}
            />
          </TouchableOpacity>
          <Image
            source={icn.sampleUser}
            style={[styles.userImg]}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.nameText}>{params?.item?.name}</Text>
            <View style={styles.rowContainer}>
              <View style={styles.greenIcn}></View>
              <Text style={styles.activeText}>Active Now</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => { }}
            style={[
              styles.icnContainer,
              {
                backgroundColor: rgba('F5F5F5', 0.15),
              },
            ]}>
            <Image
              source={icn.videoCall}
              style={[styles.rightIcns]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { }}
            style={[
              styles.icnContainer,
              { marginLeft: wp(2) },
              {
                backgroundColor: rgba('F5F5F5', 0.15),
              },
            ]}>
            <Image
              source={icn.phoneCall}
              style={[styles.rightIcns]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <LoadingModal visible={loading} message="Loading..." />
      ) : (
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: userId || 0,
          }}
          renderInputToolbar={props => (
            <CustomInputToolbar
              {...props}
              text={text}
              onTextChanged={setText}
              onSend={onSend}
            />
          )}
          renderMessage={props => <CustomMessage {...props} />}
        />
      )}
    </View>
  );
};

export default ChatDetails;
