
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View,  TouchableWithoutFeedback } from 'react-native'
import APIs, { authAPI, endpoints } from '../../configs/APIs'
import TripDetailStyle from './TripDetailStyle'
import Style from '../../Style/Style'
import { useNavigation } from '@react-navigation/native'
import UserStyle from '../User/UserStyle'
import { Button, Icon, Modal, PaperProvider, Portal } from 'react-native-paper'
import moment from 'moment'
import { MyUserContext } from '../../configs/Context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Checkbox from 'expo-checkbox'

const TripDetail = ({route}) => {
    const tripId = route.params?.tripId
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
    const [tripDetail, setTripDetail] = useState(null)
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
        const [comments, setComments] = useState([])
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
    
    const [comment, setComment] = useState('')
    const [content, setContent] = useState('')
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


    // const checkLiked = async (tripID) => {
    //     try {
    //         const acessToken = await AsyncStorage.getItem("access-token");
    //         const response = await APIs.get(endpoints['check_liked'](tripID), {
    //             headers: {
    //                 Authorization: `Bearer ${acessToken}`
    //             }
    //         });
    //         if (response.data.liked == true) {
               
    //             setIsLiked(true);
    //         } else {
    //             setIsLiked(false);
    //         }
    //         console.log(isLiked)
    //     } catch (error) {
    //         console.error("Lỗi khi kiểm tra trạng thái 'liked':", error);
    //     }
    // };

    const handleLike = async (tripId) => {
      try {
        if (user) {
            try {
                setIsLiked(!isLiked)
                let acessToken = await AsyncStorage.getItem("acess-token")
                let res = await authAPI(acessToken).post(endpoints['like'](tripId), {
                    headers: {
                        Authorization: `Bearer ${acessToken}`
                    }
                })
                console.log(isLiked)
                if (isLiked) {
                    setIsLiked(false);
                } else {
                    setIsLiked(true);
                }
                    
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
    
    const handleDeleteTrip = async (tripId) => {
       try {
        Alert.alert(
            'Warning!',
            'Are you sure you want to delete this trip?',
            [
              { text: 'Cancel', onPress: () => nav.navigate('Detail', {'tripId': tripId})},
              { text: 'Delete', onPress: async () => {
                let acessToken = await AsyncStorage.getItem("acess-token")
                let res = await authAPI(acessToken).delete(endpoints['tripsDetail'](tripId), {
                headers: {
                    Authorization: `Bearer ${acessToken}`
                }
                })
                if(res.status === 204) {
                    Alert.alert('Notification', 'Delete trip successful')
                    nav.navigate('Trip')
                }
              }},
            ],
            { cancelable: false }
          );
            
       } catch (error) {
            console.error(error)
       }
    };

    const handleUpdateTrip = async (tripId) => {
        try {
            nav.navigate('UpdateTrip', {'tripId': tripId})
        } catch (error) {
            console.error(error)
        }
    }

    const [reportLetter, setReportLetter] = useState({})
    const handleReport = async (authUser, userID) => {
        try {
            Alert.prompt(
                'REPORT',
                'Please enter your reporting reason below',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel report'),
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: async (reason) => {
                        if(reason===null || reason.trim() === '') {
                            Alert.alert('Error', 'You must provide a reason for the report.');
                        }
                        let formReport = new FormData()
                        formReport.append('reason', reason)
                        let acessToken = await AsyncStorage.getItem("acess-token")
                        let res = await authAPI(acessToken).post(endpoints['report'](userID), formReport,{
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${acessToken}`
                        }
                        })
                        if (res.status === 200) {
                            Alert.alert('Notification', 'Report success')
                        }
                    }
                  },
                ],
                'plain-text',
              );
            
        } catch (error) {
            console.error(error)
        }
    }
    
    return (
        <View style={TripDetailStyle.body}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView style={TripDetailStyle.margin}>
                        <View>
                            {tripDetail===null? <ActivityIndicator/> : <>
                            <View style={TripDetailStyle.iconContainer}>                              
                                <TouchableOpacity style={TripDetailStyle.iconButton} onPress={() => handleLike(tripDetail.id)}>
                                    <Icon
                                        source="heart"
                                        color={isLiked ? "#FF0000" : "#C0C0C0"}
                                        size={50}
                                    />
                                </TouchableOpacity>
                                <View>
                                    {user && user.id === tripDetail.user.id && (
                                            <TouchableOpacity style={TripDetailStyle.iconButton} onPress={() => handleDeleteTrip(tripDetail.id)}>
                                                <Icon source="delete" color="red" size={50} />
                                            </TouchableOpacity>
                                    )}
                                </View>
                                <View>
                                    {user && user.id === tripDetail.user.id && (
                                            <TouchableOpacity style={TripDetailStyle.iconButton} onPress={() => handleUpdateTrip(tripDetail.id)}>
                                                <Icon source="pencil" color="red" size={50} />
                                            </TouchableOpacity>
                                    )}
                                </View>

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
                                                  {tripDetail===null?<></>:<>
                                                    {user && user.id !== c.user.id && (
                                                        <TouchableOpacity style={{marginTop: 5, marginRight: 10}} onPress={() => handleReport(user, c.user.id)}>
                                                          <Icon source="alert" color="gold" size={25}/>
                                                        </TouchableOpacity>
                                                    )}
                                                  </>}
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
                                                {user && user.id !== c.user.id && (
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
