import React, {useEffect, useState} from 'react';
import {FlatList, Image, Platform, Text, TouchableOpacity, View, ImageSourcePropType} from 'react-native';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import Searchbar from '../../Components/Searchbar';
import {styles} from './style';
import {hp, wp} from '../../Theme/Responsiveness';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../Theme/Colors';
import {getChat, searchChatContacts} from '../../Services/apis/APIs';
import {RouteProp} from '@react-navigation/native';
import LoadingModal from '../../Components/LoadingModal';
import { useSelector } from 'react-redux';
import store from '../../redux/store';


// Define types for navigation and route
interface ChatProps {
  route: RouteProp<{params: {fromCrm: boolean}}, 'params'>;
}

interface ChatItem {
  contactID: number;
  profileUrl: ImageSourcePropType; // Correct type for image source
  name: string;
  unreadMessages: number;
  lastMessage: string;
  date: string;
}

// Debounce utility function
function debounce(func: Function, wait: number): any {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]): any {
    const later = (): any => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const Chat: React.FC<ChatProps> = ({route}) => {
  const params = route?.params;
  const dispatch = useDispatch();
  const navigation = useNavigation(); // Remove specific typing for now
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [searchResults, setSearchResults] = useState<ChatItem[]>([]); // New state for search results
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
    const userId = store.getState()?.userReducer?.user?.id; 


  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const response = await getChat(); // Ensure this function is correctly implemented to fetch data
        console.log('chat is:',response?.data?.data);
        const formattedChats = response?.data?.data.map((chat: any) => ({
          contactID: chat.ContactID,
          profileUrl: icn.sampleUser, // Assuming a default image
          name: chat.ContactName,
          unreadMessages: chat.MessageCount,
          lastMessage: chat.LastMessage,
          date: new Date(chat.LastMessageTime).toLocaleDateString(),
        }));
        setChats(formattedChats);
        // const formattedChats = [
        //   {
        //     contactID: 101,
        //     profileUrl: icn.sampleUser, // Assuming a default image
        //     name: 'John Doe',
        //     unreadMessages: 3,
        //     lastMessage: 'Hey, did you check the report?',
        //     date: '5/7/2025',
        //   },
        //   {
        //     contactID: 102,
        //     profileUrl: icn.sampleUser,
        //     name: 'Jane Smith',
        //     unreadMessages: 0,
        //     lastMessage: 'Sure, Ill join the call.',
        //     date: '5/6/2025',
        //   },
        //   {
        //     contactID: 103,
        //     profileUrl: icn.sampleUser,
        //     name: 'Michael Lee',
        //     unreadMessages: 5,
        //     lastMessage: 'Lets catch up tomorrow.',
        //     date: '5/5/2025',
        //   },
        // ];
        // setChats(formattedChats);
      } catch (err: any) {
        setError(err.message || 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  // Usage in your component
  const debouncedSearchEmployee = debounce(async (text: string) => {
    console.log('text is:', text);
    const response = await searchChatContacts({ name: text });
    console.log('response is:', response?.data?.data);

    // Update search results state
    const formattedSearchResults = response?.data?.data.map((contact: any) => ({
      contactID: contact.contactID,
      profileUrl: icn.sampleUser, // Assuming a default image
      name: contact.name,
      unreadMessages: 0, // Assuming no unread messages for search results
      lastMessage: '', // No last message for search results
      date: '', // No date for search results
    }));
    setSearchResults(formattedSearchResults);
  }, 300);

  const renderChat = ({item}: {item: ChatItem}) => {
    console.log("==========user==========",userId);
    console.log("==========item==========",item);
    if(item?.contactID === userId){
      return null;
    }
    

    return (
      <TouchableOpacity onPress={() => navigation.navigate('ChatDetails', { item })}>
        <View style={styles.spaceContainer}>
          <View style={styles.rowContainer}>
            <Image
              source={item.profileUrl}
              style={styles.userImg}
              resizeMode="contain"
            />
            <View style={styles.userDataContainer}>
              <View style={styles.rowContainer}>
                <Text style={styles.userName}>{item?.name}</Text>
                {item.unreadMessages > 0 && (
                  <View
                    style={[
                      styles.blueContainer,
                      {
                        paddingHorizontal:
                          wp(1.2) +
                          wp(
                            item?.unreadMessages?.toString()?.length > 1
                              ? 0.08 * item?.unreadMessages?.toString()?.length
                              : 0,
                          ),
                        paddingVertical:
                          hp(0.1) +
                          hp(
                            item?.unreadMessages?.toString()?.length > 1
                              ? 0.2 * item?.unreadMessages?.toString()?.length
                              : 0,
                          ),
                      },
                    ]}>
                    <Text style={styles.messageText}>
                      {item?.unreadMessages}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.lastMessage}>{item?.lastMessage}</Text>
            </View>
          </View>
          <Text style={styles.lastMessage}>{item?.date}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainView}>
      <View style={styles.subContainer}>
        <Header
          leftIcnStyle={styles.leftIcn}
          onLeftIconPress={() => navigation.goBack()}
          rightFirstIcnStyle={styles.rightIcn}
          title={params?.fromCrm ? 'CRM Messenger' : 'Chats'}
          leftIcn={icn.back}
          rightFirstIcn={icn.newChat}
        />
        <Searchbar placeholder="Search" onChangeText={debouncedSearchEmployee} />
        {params?.fromCrm && (
          <View style={styles.rowSpaceContainer}>
            <TouchableOpacity
              onPress={() => setSelectedFilter('All')}
              style={[
                styles.filterContainer,
                {
                  backgroundColor:
                    selectedFilter === 'All' ? Colors.primary : Colors.dullWhite,
                },
              ]}>
              <Image
                source={icn.options}
                style={styles.filterImg}
                resizeMode="contain"
                tintColor={selectedFilter === 'All' ? Colors.white : Colors.greyIcn}
              />
              <Text
                style={[
                  styles.allText,
                  {
                    color:
                      selectedFilter === 'All' ? Colors.white : Colors.greyIcn,
                  },
                ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedFilter('Email')}
              style={[
                styles.filterContainer,
                {
                  backgroundColor:
                    selectedFilter === 'Email'
                      ? Colors.primary
                      : Colors.dullWhite,
                },
              ]}>
              <Image
                source={icn.email}
                style={styles.filterImg}
                resizeMode="contain"
                tintColor={
                  selectedFilter === 'Email' ? Colors.white : Colors.greyIcn
                }
              />
              <Text
                style={[
                  styles.allText,
                  {
                    color:
                      selectedFilter === 'Email' ? Colors.white : Colors.greyIcn,
                  },
                ]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedFilter('Sms')}
              style={[
                styles.filterContainer,
                {
                  backgroundColor:
                    selectedFilter === 'Sms' ? Colors.primary : Colors.dullWhite,
                },
              ]}>
              <Image
                source={icn.sms}
                style={styles.filterImg}
                resizeMode="contain"
                tintColor={selectedFilter === 'Sms' ? Colors.white : Colors.greyIcn}
              />
              <Text
                style={[
                  styles.allText,
                  {
                    color:
                      selectedFilter === 'Sms' ? Colors.white : Colors.greyIcn,
                  },
                ]}>
                Sms
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {loading ? (
          <LoadingModal visible={loading} message="Loading..." />
        ) : error ? (
          <Text>Error: {error}</Text>
        ) : (
          <FlatList
            data={searchResults.length > 0 ? searchResults : chats} // Use search results if available
            style={styles.flatListContainer}
            renderItem={renderChat}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          />
        )}
      </View>
    </View>
  );
};

export default Chat;
