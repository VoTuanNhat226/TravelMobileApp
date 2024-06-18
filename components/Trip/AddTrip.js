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
    const [selectedImage, setSelectedImage] = useState({});  

    const [description, setDescription] = useState('');
    const [timeStart, setTimeStart] = useState('');
    const [timeFinish, setTimeFinish] = useState('');
    
    const [user, setUser] = useState({})
    const userAuth = useContext(MyUserContext)
    
    const [post, setPost] = useState(1);
    const [posts, setPosts] = useState([])

    const [client, setClient] = useState([
      {
        "id": 1,
        "first_name": "Trần",
        "last_name": "Duy",
        "email": "justvnn0507@gmail.com",
        "username": "admin",
        "avatar": "http://res.cloudinary.com/dxxwcby8l/image/upload/v1718089169/s3wljivfdqdg8ebd1zze.jpg"
      },
    {
        "id": 6,
        "first_name": "Son Duy",
        "last_name": "Tran",
        "email": "sonduy@gmail.com",
        "username": "sonduy",
        "avatar": "http://res.cloudinary.com/dxxwcby8l/image/upload/v1717080626/tavea99kflxgeq9r0c8c.jpg"
    }
    ])
    
    const [place, setPlace] = useState([
      {
        "id": 1,
        "title": "Yongin",
        "image": "http://res.cloudinary.com/dxxwcby8l/image/upload/v1716781486/hb1bjxhhfzydssnpqk3d.png",
        "created_date": "2024-05-27 03:44:46"
    },
    {
        "id": 2,
        "title": "Nampodong Market",
        "image": "http://res.cloudinary.com/dxxwcby8l/image/upload/v1717114762/dkqior8f2ligd07ebmbe.webp",
        "created_date": "2024-05-31 00:19:22"
    },
    ]);
    const [places, setPlaces] = useState([])
    
    const [loading, setLoading] = useState(false)
    const nav = useNavigation()
    
    const [isTimeStartPickerVisible, setIsTimeStartPickerVisibility] = useState(false); //state hiện picker startTime
    const [isTimeFinishPickerVisible, setIsTimeFinishPickerVisibility] = useState(false); //state hiện picker finishTime
    
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
      date = formatStartDate(date)
      setTimeStart(date)
      console.log('Time start', timeStart)
      hideStartDatePicker();
    };
    //function confirm finishStart
    const handleConfirmTimeFinish = (date) => {
      date = formatFinishDate(date)
      setTimeFinish(date)
      console.log('Time finish', timeFinish)
      hideFinishDatePicker();
    };
    const formatStartDate = (date) => {
        return moment(date).format('YYYY-MM-DD');
    };
    const formatFinishDate = (date) => {
      return moment(date).format('YYYY-MM-DD');
    };

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
    const changePost = (field, value) => {
      setPost(value)
    };
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

    const picker = async () => {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') 
            Alert.alert("TripApp", "Permissions Denied!")
        else {
            let res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            })
            if (!res.canceled){
              setSelectedImage(res.assets[0].uri)
              changeImage("image", {
                uri: res.assets[0].uri,
                type: res.assets[0].type,
                name: res.assets[0].fileName
              })
            }
        }
    };
    const changeImage = (field, value) => {
      setImage((current) => {
        return { ...current, [field]: value };
      });
    };

    const handleCreateTrip = async () => {
      setLoading(true);
      try {
        let formTrip = new FormData()
          formTrip.append('title', title);
          formTrip.append('image', {
            uri: selectedImage,
            name: image.image.name,
            type: image.image.type
          })
          formTrip.append('description', description);
          formTrip.append('time_start', timeStart);
          formTrip.append('time_finish', timeFinish);
          // formTrip.append('user', userAuth.id);
          formTrip.append('post_id', post);
          formTrip.append('client', client);
          formTrip.append('place', place);
          console.log(formTrip)
        let acessToken = await AsyncStorage.getItem("acess-token")
        let res = await authAPI(acessToken).post(endpoints['add_trip'], formTrip, {
            headers: {
              'Content-Type': 'multipart/form-data',
               Authorization: `Bearer ${acessToken}`
            }
          })
          if (res.status === 201) {
            Alert.alert('Notification', 'Create success');
            nav.navigate('Trip')
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
                    <Picker.Item key={post.id} label={post.title} value={post.id} />
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
                  {selectedImage && <Image style={TripStyle.imageTrip} source={{uri: selectedImage}}/>}
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
