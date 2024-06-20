import React, { useEffect, useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import APIs, { endpoints } from '../../configs/APIs'
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


const UpdateTrip = ({route}) => {
    const tripId = route.params?.tripId
    const [loading, setLoading] = useState(false)
    const [trip, setTrip] = useState(null)
    const [title, setTitle] = useState()
    const [description, setDescription] = useState()
    const [post, setPost] = useState(1);
    const [posts, setPosts] = useState([])


    const loadTrip = async () => {
        try {
            console.log(trip)
            setIsLoading(true)
            let res = await APIs.get(endpoints['tripsDetail'](tripId))
            setTrip(res.data)
            setTitle(res.data.title)
            setDescription(res.data.description)
            setTimeStart(res.data.timeStart)
            setTimeFinish(res.data.timeFinish)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
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
    const [timeStart, setTimeStart] = useState('');
    const [timeFinish, setTimeFinish] = useState('');

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
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView>
            <Text style={TripStyle.headerTitle}>Edit trip</Text>
            <View>
                <PaperTextInput underlineColor='white' style={UserStyle.textInput}  value={title} onChangeText={setTitle}/>
                <PaperTextInput underlineColor='white' style={UserStyle.textInput}  value={description} onChangeText={setDescription}/>
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
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default UpdateTrip
