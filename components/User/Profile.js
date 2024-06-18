import React, { useContext, useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, Alert} from 'react-native'
import { MyDispatchContext, MyUserContext } from '../../configs/Context'
import { Button, List, TouchableRipple, Icon } from 'react-native-paper'
import UserStyle from './UserStyle'
import TripStyle from '../Trip/TripStyle'
import APIs, { authAPI, endpoints } from '../../configs/APIs'
import TripDetailStyle from '../TripDetail/TripDetailStyle'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Profile = () => {
    const user = useContext(MyUserContext)
    const dispatch = useContext(MyDispatchContext)
    const [trips, setTrips] = useState(null)
    const nav = useNavigation()


    const handleLoadTrip = async (userId) => {
      try {
        let acessToken = await AsyncStorage.getItem("acess-token")
        let res = await authAPI(acessToken).get(endpoints['getTripOwner'](userId))

        if (res.status === 200) {
          setTrips(res.data)
          console.log(trips)
        }
        else{
          Alert.alert('Warning', 'No Trip')
        }
      }catch(error){
        console.log(error)
      }
      
     
    }
    const loadTrip = async () => {
      let res = await APIs.get(endpoints['trips'])
    }
    useEffect(() => {
      loadTrip()
    },[])
    // useEffect(() => {
    //   loadTrip()
    // },[])

    const toTripDetail = (tripId) => {
      nav.navigate('Detail', {'tripId': tripId})
    }
  return (
    <View style={UserStyle.marginTop}>
      <View>
          <Text style={UserStyle.headerProfile}>Profile</Text>
      </View>
      <ScrollView>
        <View>
            <Image style={UserStyle.profileAvatar} source={{uri: user.avatar}}/>
        </View>
        <Text style={UserStyle.nameUser}>{user.last_name} {user.first_name}</Text>
        <View>
          <Button icon="logout" onPress={() => dispatch({"type": "logout"})}>ĐĂNG XUẤT</Button>
        </View>
        <View style={TripDetailStyle.flex}>
          <Text style={[TripDetailStyle.title, {marginLeft:20} ]}>Your trip:</Text>
          <TouchableOpacity style={{marginTop: 5, marginRight: 10}} onPress={() => handleLoadTrip(user.id)}>
            <Icon source="eye" color="black" size={25}/>
          </TouchableOpacity>
          {trips === null ? <></>:<>
            {trips.map(t => <>
              {user.id === t.user.id?<>
                <TouchableOpacity key={t.id}>
                  <List.Item title={t.title} description={t.created_date?moment(t.created_date).fromNow():""} left={() => <Image style={UserStyle.yourTripImg} source={{uri: t.image}}/>}/>
                </TouchableOpacity>
              </>:<>
              </>}
            </>)}
          </>}
        </View>
      </ScrollView>
    </View>
  )
}

export default Profile
