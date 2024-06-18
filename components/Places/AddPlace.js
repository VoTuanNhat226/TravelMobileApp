import React, { useState } from 'react'
import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Image, Alert } from 'react-native'
import { Button, TextInput as PaperTextInput, TouchableRipple } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'

import TripStyle from '../Trip/TripStyle'
import UserStyle from '../User/UserStyle'

import * as ImagePicker from "expo-image-picker";
import { Picker } from '@react-native-picker/picker'
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authAPI, endpoints } from '../../configs/APIs'

const AddPlace = ({route}) => {
    const tripId = route.params?.tripId
    const [title, setTitle] = useState()
    const [image, setImage] = useState({})
    const [selectedImage, setSelectedImage] = useState({})
    const [content, setContent] = useState()
    const [openTime, setOpenTime] = useState()
    const [price, setPrice] = useState(0)

    const [loading, setLoading] = useState(false)
    const nav = useNavigation()

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

    const handleAddPlace = async () => {
        setLoading(true)
        try {
            let formPlace = new FormData()
                formPlace.append('title', title)
                formPlace.append('content', content)
                formPlace.append('open_time', openTime)
                formPlace.append('price', price)
                // formPlace.append('trip', tripId)
                formPlace.append('image', {
                    uri: selectedImage,
                    name: image.image.name,
                    type: image.image.type
                  })
            let acessToken = await AsyncStorage.getItem("acess-token")
            let res = await authAPI(acessToken).post(endpoints['addPlace'](tripId), formPlace, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                   Authorization: `Bearer ${acessToken}`
                }
              })
            if (res.status === 201) {
              Alert.alert('Notification', 'Add place successful');
              nav.goBack()
            }   
            console.log(formPlace)
        } catch (error) {
            console.error(error)
            Alert.alert('Notification', 'Try again');
        }   finally {
            setLoading(false)
        }
    }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView>
        <Text style={TripStyle.headerTitle}>Add a place</Text>
        <View>
            <PaperTextInput underlineColor='white' style={UserStyle.textInput} placeholder="Title" value={title} onChangeText={setTitle}/>
            <PaperTextInput underlineColor='white' style={UserStyle.textInput} placeholder="Content" value={content} onChangeText={setContent}/>
            <PaperTextInput underlineColor='white' style={UserStyle.textInput} placeholder="Price" value={price} onChangeText={setPrice}/>
            <PaperTextInput underlineColor='white' style={UserStyle.textInput} placeholder="Open time" value={openTime} onChangeText={setOpenTime}/>
        </View>
        <View style={{marginTop: 20}}>
            <View style={TripStyle.borderChooseAvatar}>
                <TouchableRipple onPress={picker} style={UserStyle.header}>
                    <Text>Choose image...</Text>
                </TouchableRipple>
            </View>
            <View style={{width: 370, height: 200, borderWidth: 1, borderColor: '#444444', marginLeft: 20}}>
              {selectedImage && <Image style={TripStyle.imageTrip} source={{uri: selectedImage}}/>}
            </View>
        </View>
        <View style={{marginTop: 30, marginBottom: 50}}>
          <Button style={UserStyle.btnRegister} loading={loading} onPress={handleAddPlace} mode="contained" icon="plus">Add place</Button>
        </View>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AddPlace