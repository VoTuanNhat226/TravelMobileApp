
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import APIs, { authAPI, endpoints } from '../../configs/APIs'
import TripDetailStyle from './TripDetailStyle'
import Style from '../../Style/Style'
import { useNavigation } from '@react-navigation/native'
import UserStyle from '../User/UserStyle'
import { Button, Icon } from 'react-native-paper'
import moment from 'moment'
import { MyUserContext } from '../../configs/Context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Checkbox from 'expo-checkbox'

const TripDetail = ({route}) => {
    const tripId = route.params?.tripId
    const [tripDetail, setTripDetail] = useState(null)
    const [comments, setComments] = useState([])
    const [comment, setComment] = useState('')
    const [content, setContent] = useState('')
    const [isChecked, setIsChecked] = useState(false)
    const [checkedItems, setCheckedItems] = useState([]);
    const [isLiked, setIsLiked] = useState(false)
    const nav = useNavigation()
    const commentInputRef = useRef(null);
    const user = useContext(MyUserContext)

    
    const [showPar, setShowPar] = useState(false);
    const togglePar = () => {
        setShowPar(!showPar);
    };
    const [showPlace, setShowPlace] = useState(false);
    const togglePlace = () => {
        setShowPlace(!showPlace);
    };

    //Load TripDetail
    const loadTripDetail = async () => {
        try {
            let res = await APIs.get(endpoints['tripsDetail'](tripId))
            setTripDetail(res.data)
            } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        loadTripDetail()
    },[tripId])

    //Load Comments
    const loadComments = async () => {
        try {
            let res = await APIs.get(endpoints['comments'](tripId))
            setComments(res.data)
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        loadComments()
    }, [])

    // const handlePlaceDetail = (placeId) => {
    //         nav.navigate('Places', {'placeId' : placeId})
    // }

    const addComments = async () => {
        try {
            if(user) {
                if (!comment) {
                    Alert.alert('Notification', 'There are no comments yet');
                    return;
                } else {
                    try {
                        let acessToken = await AsyncStorage.getItem("acess-token")
                        let res = await authAPI(acessToken).post(endpoints['postComment'](tripId), {
                            'content': content
                        }, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                 Authorization: `Bearer ${acessToken}`
                              }
                        })
                        setComments(current => {
                            return [res.data, ...current]
                        })
                        setContent('')
                       console.info(res.data)
                       // Focus vào TextInput sau khi thêm comment thành công
                        commentInputRef.current.focus();
                    } catch (error) {
                        console.error(error)
                        Alert.alert('Warning!', error.message )
                    }
                }

            } else {
                Alert.alert(
                'Notification',
                'You need to login.',
                [
                    {
                    text: 'OK',
                    onPress: () => nav.navigate('Login'),
                    },
                ],
                { cancelable: false }
                );
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleLike = async (tripID) => {
      try {
        if (user) {
            try {
                setIsLiked(!isLiked)
                let acessToken = await AsyncStorage.getItem("acess-token")
                let res = await authAPI(acessToken).post(endpoints['like'](tripId), {
                    'liked': isLiked
                })
                console.log(isLiked)
            } catch (error) {
                console.error(error)
            }
        } else {
            Alert.alert(
                'Notification',
                'You need to login.',
                [
                    {
                    text: 'OK',
                    onPress: () => nav.navigate('Login'),
                    },
                ],
                { cancelable: false }
                );
        }
      } catch (error) {
        console.error(error)
      }
    }
    

    return (
        <View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView style={TripDetailStyle.margin}>
                           
                        <View>
                            {tripDetail===null? <ActivityIndicator/> : <>
                                <View>
                                <TouchableOpacity style={{width: 50, height: 50}} onPress={handleLike}>
                                    <Icon
                                        source="heart"
                                        color={isLiked ? "#FF0000" : "#C0C0C0"}
                                        size={50}
                                    />
                                </TouchableOpacity>
                            </View>

                                    {/* Hình và title Trip */}
                                    <View key={tripDetail.id}>
                                        <Image style={TripDetailStyle.img} source={{uri: tripDetail.image}}/>
                                        <Text style={TripDetailStyle.title}>{tripDetail.title}</Text>
                                        <View style={TripDetailStyle.line}></View>
                                    </View>
                                    {/* Người tham gia */}
                                    <View>
                                        <TouchableOpacity onPress={togglePar}>
                                            <Text style={TripDetailStyle.title}>Participants: {tripDetail.client.length}</Text>
                                        </TouchableOpacity>
                                            {showPar && (
                                                <View >{tripDetail.client.map(c => (
                                                    <View style={TripDetailStyle.flex} key={c.id}>
                                                        <View>
                                                            <Text style={[TripDetailStyle.parName]}>{c.last_name} {c.first_name}</Text>
                                                            <Text>{c.email}</Text>
                                                        </View>
                                                        <Image style={TripDetailStyle.parAvatar} source={{uri: c.avatar}}/>
                                                    </View>
                                                ))}</View>
                                            )}  
                                    </View>
                                    {/*  */}
                            </>}
                        </View>
                    <View style={TripDetailStyle.line}></View>
                        <View>
                            {tripDetail===null? <ActivityIndicator/> : <>
                                <View key={tripDetail.user.id} style={TripDetailStyle.flex}>
                                        <View>
                                            <Text style={[TripDetailStyle.title, TripDetailStyle.name]}>{tripDetail.user.last_name} {tripDetail.user.first_name}</Text>
                                            <Text>{tripDetail.user.email}</Text>
                                        </View>
                                        <Image style={TripDetailStyle.avatar} source={{uri: tripDetail.user.avatar}}/>
                                </View>
                            </>}
                        </View>
                    <View style={TripDetailStyle.line}></View>
                        <View>
                            <Text style={TripDetailStyle.title}>Description</Text>
                            <Text></Text>
                        </View>
                    <View style={TripDetailStyle.line}></View>
                        <View>
                            {tripDetail===null? <ActivityIndicator/> : <>
                            <TouchableOpacity onPress={togglePlace}>
                                <Text style={TripDetailStyle.title}>Explore & Tours</Text>
                            </TouchableOpacity>
                            {showPlace && (
                                <View>
                                    {tripDetail.place.map(c => (
                                    <View style={TripDetailStyle.flex}>
                                        <View>
                                            <TouchableOpacity onPress={() => handlePlaceDetail(c.id)}>
                                                <Text style={[TripDetailStyle.parName]}>{c.title}</Text>
                                                <Text>{c.created_date?moment(c.created_date).fromNow():""}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Image style={TripDetailStyle.parAvatar} source={{uri: c.image}}/>
                                    </View>
                                    ))}  
                                </View>
                            )}            
                            </>}    
                        </View>
                    <View style={TripDetailStyle.line}></View>
                            <View>
                                {/* <RefreshControl onRefresh={() => loadComments()}/> */}
                                <Text style={TripDetailStyle.title}>Comments</Text>
                                        <View style={TripDetailStyle.flex}>
                                            <TextInput value={content} onChangeText={t => {setContent(t), setComment(t)}}  ref={commentInputRef} style={TripDetailStyle.cmtInput}></TextInput>
                                            <TouchableOpacity onPress={addComments} style={TripDetailStyle.cmtSend}>
                                                <Text style={{paddingLeft: 12, color: '#333333'}} >Send</Text>
                                            </TouchableOpacity>
                                        </View>
                                <View>
                                    {comments.map((c) => <>
                                        <View>
                                            <View>
                                                <View style={TripDetailStyle.cmtFlex} key={c.id} >
                                                    <Image style={TripDetailStyle.cmtAvatar} source={{uri: c.user.avatar}}/>
                                                    <View>
                                                        <View style={TripDetailStyle.cmtFlex}>
                                                            <Text style={TripDetailStyle.cmtName}>{c.user.last_name} {c.user.first_name}</Text>
                                                            <Text style={TripDetailStyle.cmtCreateDate}>{c.created_date?moment(c.created_date).fromNow():""}</Text>
                                                        </View>
                                                        <View>
                                                            <Text style={TripDetailStyle.cmtContent}>{c.content}</Text>
                                                        </View>                                               
                                                    </View>
                                                </View>
                                            </View>
                                            {tripDetail===null?<></>: <>
                                                {user && user.id === tripDetail.user.id && (
                                                <View>
                                                    <Checkbox key={c.user.id} value={isChecked} onValueChange={() => setIsChecked(!isChecked)} style={TripDetailStyle.cmtCheck} color='#444444'/>
                                                </View>
                                           )}
                                            </>}
                                        </View>
                                    </>)}
                                </View>
                            </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default TripDetail
