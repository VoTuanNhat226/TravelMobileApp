import React, { useEffect, useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native'
import APIs, { authAPI, endpoints } from '../../configs/APIs'
import TripStyle from './TripStyle'
import { Button, TextInput as PaperTextInput, TouchableRipple } from 'react-native-paper'
import UserStyle from '../User/UserStyle'
import { TouchableOpacity } from 'react-native-gesture-handler'
import * as ImagePicker from "expo-image-picker";
import { Picker } from '@react-native-picker/picker'
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage'


const UpdateTrip = ({route}) => {
  const tripId = route.params?.tripId
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')

  const [image, setImage] = useState({})
  const [selectedImage, setSelectedImage] = useState({});  

  const [description, setDescription] = useState()
  const [timeStart, setTimeStart] = useState('');
  const [timeFinish, setTimeFinish] = useState('');

  const [post, setPost] = useState(1);
  const [posts, setPosts] = useState([])

  const [client, setClient] = useState([])
  const [place, setPlace] = useState([])

  const loadTrip = async () => {
      setLoading(true)
      try {
          console.log(trip)
          let res = await APIs.get(endpoints['tripsDetail'](tripId))
          setTrip(res.data)
          setTitle(res.data.title)
          setDescription(res.data.description)
          setTimeStart(res.data.time_start)
          setTimeFinish(res.data.time_finish)
          setPost(res.data.post)
          setClient(res.data.client)
          setPlace(res.data.place)
          setSelectedImage(res.data.image)
      } catch (error) {
          console.error(error)
      } finally {
          setLoading(false)
      }
  }
  useEffect(() => {
      loadTrip()
  }, [tripId])
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

  const handleUpdateTrip = async (tripId) =>{
    setLoading(true);
      try {
        let formTrip = new FormData()
          formTrip.append('title', title);
          formTrip.append('image', {
            uri: selectedImage,
            name: image.name,
            type: image.type
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
        let res = await authAPI(acessToken).patch(endpoints['update_trip'](tripId), formTrip, {
            headers: {
              'Content-Type': 'multipart/form-data',
               Authorization: `Bearer ${acessToken}`
            }
          })
          if (res.status === 200) {
            Alert.alert('Notification', 'Update successful');
            nav.goBack()
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
            <Text style={TripStyle.headerTitle}>Edit trip</Text>
            <View>
                <PaperTextInput underlineColor='white' style={UserStyle.textInput}  value={title} onChangeText={setTitle}/>
                <PaperTextInput underlineColor='white' style={UserStyle.textInputDescription} value={description} onChangeText={setDescription}/>
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
                {/* Button update trip */}
              <View style={{marginTop: 30, marginBottom: 50}}>
                <Button style={UserStyle.btnRegister} onPress={() => handleUpdateTrip(tripId)} loading={loading} mode="contained" icon="plus">Update</Button>
              </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default UpdateTrip
