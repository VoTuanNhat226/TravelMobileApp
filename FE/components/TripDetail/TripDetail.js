
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View,  TouchableWithoutFeedback } from 'react-native'
import APIs, { authAPI, endpoints } from '../../configs/APIs'
import TripDetailStyle from './TripDetailStyle'
import Style from '../../Style/Style'
import { useNavigation } from '@react-navigation/native'
import UserStyle from '../User/UserStyle'
import TripStyle from '../Trip/TripStyle'
import { Button, Icon, Modal, PaperProvider, Portal , TouchableRipple} from 'react-native-paper'
import moment from 'moment'
import { MyUserContext } from '../../configs/Context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Checkbox from 'expo-checkbox'
import * as ImagePicker from "expo-image-picker";
import { Picker } from '@react-native-picker/picker'

const TripDetail = ({route}) => {
    const tripId = route.params?.tripId
    const [isChecked, setIsChecked] = useState(false)
    const [checkedItems, setCheckedItems] = useState([]);
    const [isLiked, setIsLiked] = useState(false)
    const nav = useNavigation()
    const commentInputRef = useRef(null)
    const ratingInputRef = useRef(null);
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
        }}
        //Load Ratings
        const [ratings, setRatings] = useState([])
        const loadRatings = async () => {
            try {
                let res = await APIs.get(endpoints['ratings'](tripId))
                setRatings(res.data)
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        loadComments()
    }, [])
    useEffect(() => {
        loadRatings()
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



    const [rating, setRating] = useState('')
    const [ratingContent, setRatingContent] = useState('')
    const addRatings = async () => {
        try {
            if(user) {
                if (!rating) {
                    Alert.alert('Notification', 'There are no ratings yet');
                    return;
                } else {
                    try {
                        let formRating = new FormData()
                        formRating.append('content', ratingContent);
                        formRating.append('image', {
                          uri: selectedImage,
                          name: image.image.name,
                          type: image.image.type
                        })

                       
                        let acessToken = await AsyncStorage.getItem("acess-token")
                        let res = await authAPI(acessToken).post(endpoints['ratings'](tripId), formRating, 
                                {headers: {
                                    'Content-Type': 'multipart/form-data',
                                     Authorization: `Bearer ${acessToken}`
                                  }}
                        )
                        setRatings(current => {
                            return [res.data, ...current]
                        })
                        setRatingContent('')
                       console.info(res.data)
                       // Focus vào TextInput sau khi thêm rating thành công
                       ratingInputRef.current.focus();
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


    const checkLiked = async (tripID) => {
        try {
            const acessToken = await AsyncStorage.getItem("acess-token");
            const response = await authAPI(acessToken).get(endpoints['check_liked'](tripID));

            if (response.data.liked === true) {
               
                setIsLiked(true);
            } else {
                setIsLiked(false);
            }

        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái 'liked':", error);
        }
    };
    useEffect(() => {
        checkLiked(tripId)
    }, [tripId])
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
            nav.navigate('UpdateTrip', {'tripId': tripId})
    }

    const toPlaceDetail = (placeId) => {
        nav.navigate('PlaceDetail', {'placeId': placeId})
    }

    const toEditTrip = () => {
        nav.navigate('UpdateTrip', {'tripId': tripId})
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
                        } else {
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
                                Alert.alert('Notification', 'Report successful')
                            }
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

    const handleDeleteComment = async (tripId, commentId) => {
        try {
         Alert.alert(
             'Warning!',
             'Are you sure you want to delete this comment?',
             [
               { text: 'Cancel', onPress: () => nav.navigate('Detail', {'tripId': tripId})} ,
               { text: 'Delete', onPress: async () => {
                 let acessToken = await AsyncStorage.getItem("acess-token")
                 let res = await authAPI(acessToken).delete(endpoints['delete_comment'](tripId, commentId))
                 console.log(tripId, commentId)
                 if(res.status === 204) {
                     Alert.alert('Notification', 'Delete comment successful')
                     nav.navigate('Detail',  {'tripId': tripId})
                 }
                 else 
                    Alert.alert('Notification', 'Delete comment unsuccessful')
               }},
             ],
             { cancelable: false }
           );
             
        } catch (error) {
             console.error(error)
        }
     };

     const handleEditComment = async (tripId,commentId) => {
        try {
            Alert.prompt(
                'Edit Comment',
                'Please enter your new comment',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel edit'),
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: async (content) => {
                        if(content===null || content.trim() === '') {
                            Alert.alert('Error', 'You must provide a comment.');
                        } else {
                            setComment((prevState) => ({
                                ...prevState,
                                'content': content,
                                
                              }));
                            console.log(comment)
                            let acessToken = await AsyncStorage.getItem("acess-token")
                            let res = await authAPI(acessToken).patch(endpoints['edit_comment'](tripId, commentId), comment,{
                            headers: {
                                "Content-Type": "multipart/form-data",
                                Authorization: `Bearer ${acessToken}`
                            }
                            })
                            if (res.status === 200) {
                                Alert.alert('Notification', 'Edit Comment Successfully')
                            }
                            else {
                                Alert.alert('Notification', 'Edit Comment Unsuccessfully')
                            }
                        }
                    }
                  },
                ],
                'plain-text',
              );
            
        } catch (error) {
            console.error(error)
        }
     };

     const handleDeletePlace = async (tripId, placeId) => {
        try {
         Alert.alert(
             'Warning!',
             'Are you sure you want to delete this place?',
             [
               { text: 'Cancel', onPress: () => nav.navigate('Detail', {'tripId': tripId})} ,
               { text: 'Delete', onPress: async () => {
                 let acessToken = await AsyncStorage.getItem("acess-token")
                 let res = await authAPI(acessToken).delete(endpoints['delete_place'](tripId, placeId))
                 if(res.status === 204) {
                     Alert.alert('Notification', 'Delete place successful')
                     nav.navigate('Detail',  {'tripId': tripId})
                 }
                 else 
                    Alert.alert('Notification', 'Delete place unsuccessful')
               }},
             ],
             { cancelable: false }
           );
             
        } catch (error) {
             console.error(error)
        }
     };

     const handleDeleteRating = async (tripId, ratingId) => {
        try {
         Alert.alert(
             'Warning!',
             'Are you sure you want to delete this rating?',
             [
               { text: 'Cancel', onPress: () => nav.navigate('Detail', {'tripId': tripId})} ,
               { text: 'Delete', onPress: async () => {
                 let acessToken = await AsyncStorage.getItem("acess-token")
                 let res = await authAPI(acessToken).delete(endpoints['delete_rating'](tripId, ratingId))
                 if(res.status === 204) {
                     Alert.alert('Notification', 'Delete rating successful')
                     nav.navigate('Detail',  {'tripId': tripId})
                 }
                 else 
                    Alert.alert('Notification', 'Delete rating unsuccessful')
               }},
             ],
             { cancelable: false }
           );
             
        } catch (error) {
             console.error(error)
        }
     };
    
    const handleAddPlace = (tripId) => {
        nav.navigate('AddPlace', {'tripId': tripId})
    }

    const [image, setImage] = useState({})
    const [selectedImage, setSelectedImage] = useState({}); 
    const [choosePic, setChoosePic] = useState(false)
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
              setChoosePic(true)
          }
      };
      const changeImage = (field, value) => {
        setImage((current) => {
          return { ...current, [field]: value };
        });
      };

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
                           <View style={TripDetailStyle.flex}>
                                <TouchableOpacity onPress={togglePlace}>
                                    <Text style={TripDetailStyle.title}>Explore & Tours</Text>
                                </TouchableOpacity>
                                {user && user.id === tripDetail.user.id && (
                                    <TouchableOpacity style={{marginTop: 5, marginRight: 5, marginBottom: -10}} onPress={() => handleAddPlace(tripId)}> 
                                        <Icon source="plus-box" color="green" size={40}/>
                                    </TouchableOpacity>
                                )}
                           </View>
                            {showPlace && (
                                <View style={{marginTop: 10}}>
                                    
                                    {tripDetail.place.map(c => (
                                    <View style={TripDetailStyle.flex}>
                                        <View style={TripDetailStyle.flex}>
                                        {user && user.id === tripDetail.user.id && (
                                                        <TouchableOpacity style={{marginTop: 15, marginRight: 5}} onPress={() => handleDeletePlace(tripDetail.id, c.id)}> 
                                                          <Icon source="alpha-x-box" color="red" size={20}/>
                                                        </TouchableOpacity>
                                        )}
                                            <TouchableOpacity onPress={() => toPlaceDetail(c.id)}>
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
                                                  {tripDetail===null? <></>:<>
                                                    {user && user.id === c.user.id && (
                                                        <TouchableOpacity style={{marginTop: 5, marginRight: 10}} onPress={() => handleDeleteComment(tripDetail.id, c.id)}> 
                                                          <Icon source="alpha-x-box" color="red" size={25}/>
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
                                                {user && user.id === c.user.id &&  (
                                                    <View>
                                                        <TouchableOpacity style={TripDetailStyle.cmtCheck} onPress={() => handleEditComment(tripDetail.id, c.id)}> 
                                                          <Icon source="pencil" color="black" size={25}/>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}                               
                                                
                                            </>}
                                            {tripDetail===null?<></>: <>
                                                {tripDetail.client.map(u => (
                                                    <View key={u.id}>
                                                        {user && user.id === tripDetail.user.id && c.user.id !== tripDetail.user.id && (
                                                        <View>
                                                            <Checkbox key={c.user.id} value={isChecked} onValueChange={() => setIsChecked(!isChecked)} style={TripDetailStyle.cmtCheck} color='#444444'/>
                                                        </View>
                                                        )}
                                                    </View>
                                                ))}
                                                
                                            </>}
                                            
                                        </View>
                                    </>)}
                                </View>
                            </View>

                            {/* Rating */}
                            <View style={TripDetailStyle.line}></View>
                            <View>
                                {/* <RefreshControl onRefresh={() => loadComments()}/> */}
                                <Text style={TripDetailStyle.title}>Ratings</Text>
                                <View style={TripDetailStyle.flex}>
                                            <TextInput value={ratingContent} onChangeText={t => {setRatingContent(t), setRating(t)}}  ref={ratingInputRef} style={TripDetailStyle.ratingInput}></TextInput>
                                            <View>
                                                <View style={TripStyle.ratingChooseAvatar}>
                                                <TouchableRipple onPress={picker} style={UserStyle.header}>
                                                            <Text>Pic</Text>
                                                </TouchableRipple>
                                                </View>
                                                {choosePic && 
                                                    <View style={{width: 300, height: 200, borderWidth: 1, borderColor: '#444444', marginLeft: -220}}>
                                                    <Image style={TripStyle.ratingTrip} source={{uri: selectedImage}}/>
                                                    </View>
                                                }
                                            </View>
                                            <TouchableOpacity onPress={addRatings} style={TripDetailStyle.cmtSend}>
                                                <Text style={{paddingLeft: 10, color: '#333333'}} >Send</Text>
                                            </TouchableOpacity>
                                        </View>
                                <View>
                                    {ratings.map((c) => <>
                                        <View>
                                            <View style={{marginTop: 20}}>
                                                <View style={TripDetailStyle.cmtFlex} key={c.id} >
                                                  {tripDetail===null?<></>:<>
                                                    {user && user.id !== c.rating_user.id && (
                                                        <TouchableOpacity style={{marginTop: 5, marginRight: 10}} onPress={() => handleReport(user, c.rating_user.id)}>
                                                          <Icon source="alert" color="gold" size={25}/>
                                                        </TouchableOpacity>
                                                    )}
                                                  </>}
                                                  {tripDetail===null? <></>:<>
                                                    {user && user.id === c.rating_user.id && (
                                                        <TouchableOpacity style={{marginTop: 5, marginRight: 10}} onPress={() => handleDeleteRating(tripDetail.id, c.id)}> 
                                                          <Icon source="alpha-x-box" color="red" size={25}/>
                                                        </TouchableOpacity>
                                                    )}
                                                  </>}
                                                    <Image style={TripDetailStyle.ratingAvatar} source={{uri: c.rating_user.avatar}}/>
                                                    <View>
                                                        <View style={TripDetailStyle.cmtFlex}>
                                                            <Text style={TripDetailStyle.cmtName}>{c.rating_user.last_name} {c.rating_user.first_name}</Text>
                                                            <Text style={TripDetailStyle.cmtCreateDate}>{c.created_date?moment(c.created_date).fromNow():""}</Text>
                                                        </View>
                                                        <View>
                                                            <Text style={TripDetailStyle.cmtContent}>{c.content}</Text>
                                                        </View>  
                                                                                                   
                                                    </View> 
                                                </View>
                                                <View>
                                                        <Image style={TripDetailStyle.ratingImg} source={{uri: c.image}}/>
                                                </View> 
                                            </View>

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
