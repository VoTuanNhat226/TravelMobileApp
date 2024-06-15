import React, { useContext, useEffect, useState } from 'react'
import { View,TextInput, Text ,Image, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView, KeyboardAvoidingView, Platform, Alert} from 'react-native'
import { Button, TextInput as PaperTextInput, TouchableRipple } from 'react-native-paper'

import TripStyle from './TripStyle'
import UserStyle from '../User/UserStyle'

import { useNavigation } from '@react-navigation/native'
import { MyUserContext } from '../../configs/Context'
import APIs, { authAPI, endpoints } from '../../configs/APIs'

import * as ImagePicker from "expo-image-picker";
import { Picker } from '@react-native-picker/picker'
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Trip from './Trip'

const AddTrip = () => {
    LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
    LogBox.ignoreAllLogs();//Ignore all log notifications

    const [title, setTitle] = useState('');
    const [image, setImage] = useState({})
    const [description, setDescription] = useState('');
    const [timeStart, setTimeStart] = useState('');
    const [timeFinish, setTimeFinish] = useState('');
    
    const [user, setUser] = useState()
    const userAuth = useContext(MyUserContext)

    const [post, setPost] = useState(null);
    const [posts, setPosts] = useState([])

    const [client, setClient] = useState([])

    const [place, setPlace] = useState(null);
    const [places, setPlaces] = useState([])
 
    const [loading, setLoading] = useState(false)
    const nav = useNavigation()
    
    const [isTimeStartPickerVisible, setIsTimeStartPickerVisibility] = useState(false); //state hiện picker startTime
    const [isTimeFinishPickerVisible, setIsTimeFinishPickerVisibility] = useState(false); //state hiện picker finishTime
    
    //function load tất cả cái post để người dùng chọn
    const loadPost = async () => {
        try {
          setLoading(true)  
          let res = await APIs.get(endpoints['posts'])
          setPosts(res.data.results)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        loadPost()
    }, [])

    //function load tất cả cái place để người dùng chọn
    const loadPlace = async () => {
      try {
        setLoading(true)  
          let res = await APIs.get(endpoints['places'])
          setPlaces(res.data.results)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    useEffect(() => {
      loadPlace()
    }, [])

    //Function chọn ảnh cho Trip
    const picker = async () => {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') 
            Alert.alert("TripApp", "Permissions Denied!")
        else {
            let res = await ImagePicker.launchImageLibraryAsync()
            if (!res.canceled)
                changeImage('image', res.assets[0])
        }
    }
    const changeImage = (field, value) => {
      setImage((current) => {
        return { ...current, [field]: value };
      });
    };

    const changePost = (field, value) => {
      setPost(value)
    };

    //function hiện picker startTime
    const showStartDatePicker = () => {
      setIsTimeStartPickerVisibility(true)
    };
     //function ẩn picker startTime
    const hideStartDatePicker = () => {
      setIsTimeStartPickerVisibility(false)
    };
     //function hiện picker finishTime
    const showFinishDatePicker = () => {
      setIsTimeFinishPickerVisibility(true)
    };
     //function ẩn picker finishTime
    const hideFinishDatePicker = () => {
      setIsTimeFinishPickerVisibility(false)
    };

    //function confirm timeStart
    const handleConfirmTimeStart = (date) => {
      setTimeStart(date)
      console.log('Time start', timeStart)
      hideStartDatePicker();
    };
    //function confirm finishStart
    const handleConfirmTimeFinish = (date) => {
      setTimeFinish(date)
      console.log('Time finish', timeFinish)
      hideFinishDatePicker();
    };


    const formatStartDate = (date) => {
        return moment(date).format('DD/MM/YYYY');
    };
    const formatFinishDate = (date) => {
      return moment(date).format('DD/MM/YYYY');
    };

    const handleCreateTrip = async () => {
      setLoading(true);
      try {
        // console.log(userAuth)
        let acessToken = await AsyncStorage.getItem("acess-token")
        let res = await authAPI(acessToken).post(endpoints['trips'], {
            'title': title,
            'image': image,
            'description': description,
            'time_start': timeStart,
            'time_finish': timeFinish,
            'user': userAuth,
            'post': post,
            'client': client,
            'place': place
          }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${acessToken}`
            }
          })
          if (res.status === 201) {
            Alert.alert('Notification', 'Create success');
          }
      } catch (error) {
        console.error(error)
        Alert.alert('Warning!', error.message);
      } finally {
        setLoading(false)
      }
    }
    
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView>
        <Text style={TripStyle.headerTitle}>Create a trip</Text>
        <View>
            <PaperTextInput underlineColor='white' style={UserStyle.textInput} placeholder="Trip title" value={title} onChangeText={setTitle}/>
            <PaperTextInput underlineColor='white' style={UserStyle.textInput} placeholder="Description" value={description} onChangeText={setDescription}/>
            {/* Chọn time_start */}
            <View>
                <TouchableOpacity onPress={showStartDatePicker}>
                  <View pointerEvents="none" >
                      <PaperTextInput
                        label="Time Start"
                        value={timeStart ? formatStartDate(new Date(timeStart)) : ''}
                        underlineColor="white"
                        editable={false}
                        style={UserStyle.textInput}
                      />
                  </View>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isTimeStartPickerVisible}
                  mode="date"
                  date={new Date()}
                  onConfirm={handleConfirmTimeStart}
                  onCancel={hideStartDatePicker}
                />
            </View>
            {/* Chọn time_finish */}
            <View>
                <TouchableOpacity onPress={showFinishDatePicker}>
                  <View pointerEvents="none" >
                      <PaperTextInput
                        label="Time Finish"
                        value={timeFinish ? formatFinishDate(new Date(timeFinish)) : ''}
                        underlineColor="white"
                        editable={false}
                        style={UserStyle.textInput}
                      />
                  </View>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isTimeFinishPickerVisible}
                  mode="date"
                  date={new Date()}
                  onConfirm={handleConfirmTimeFinish}
                  onCancel={hideFinishDatePicker}
                />
            </View>
            {/* Chọn Post */}
            <View>
                <Text style={{marginLeft: 20, marginTop: 20, fontSize: 20, fontWeight: 'bold'}}>Choose post:</Text>
                <Picker selectedValue={post} onValueChange={(itemValue) => changePost('post', itemValue)}>
                  {posts.map((post) => (
                    <Picker.Item key={post.id} label={post.title} value={post.title} />
                  ))}
                </Picker>
            </View>
            {/* Chọn Image */}
            <View>
                <View style={TripStyle.borderChooseAvatar}>
                  <TouchableRipple onPress={picker} style={UserStyle.header}>
                              <Text>Choose image...</Text>
                  </TouchableRipple>
                </View>
                <View style={{width: 370, height: 200, borderWidth: 1, borderColor: '#444444', marginLeft: 20}}>
                  {image.image && <Image style={TripStyle.imageTrip} source={{uri: image.image.uri}}/>}
                </View>
            </View>
            {/* Button tạo trip */}
            <View style={{marginTop: 50}}>
              <Button style={UserStyle.btnRegister} onPress={handleCreateTrip} loading={loading} mode="contained" icon="plus">Create trip</Button>
            </View>
        </View> 
    </ScrollView>
    </KeyboardAvoidingView>
  )
}


export default AddTrip
