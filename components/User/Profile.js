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
  const [trips, setTrips] = useState([])
  const nav = useNavigation()
  const loadTrip = async (userId) => {
    // try {
    //   let acessToken = await AsyncStorage.getItem("acess-token")
    //   let res = await authAPI(acessToken).get(endpoints['getTripOwner'](userId))
    //   setTrips(res.data)
    //   console.log(trips)
    // } catch(error){
    //   console.log(error)
    // }
    try {
      let acessToken = await AsyncStorage.getItem("acess-token")
      let res = await authAPI(acessToken).get(endpoints['trips'])
      setTrips(res.data.results)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    loadTrip()
  },[])

  const toTripDetail = (tripId) => {
    nav.navigate('Detail', {'tripId': tripId})
  }
  return (
    <View style={UserStyle.marginTop}>
      <View>
          <Text style={UserStyle.headerProfile}>Profile</Text>
      </View>
      <ScrollView>
        {/* Avatar */}
        <View>
            <Image style={UserStyle.profileAvatar} source={{uri: user.avatar}}/>
        </View>
        {/* Tên user */}
        <Text style={UserStyle.nameUser}>{user.last_name} {user.first_name} {user.is_staff}</Text>
        {/* Button đăng xuất */}
        <View>
          <Button style={UserStyle.btnLogin} icon="logout" onPress={() => dispatch({"type": "logout"})}>ĐĂNG XUẤT</Button>
        </View>
        {/* Your trip */}
        <View style={{flex: 1,justifyContent: 'center'}}>
          <Text style={[TripDetailStyle.title, {marginLeft:20} ]}>Your trip:</Text>
          
          <View style={{marginTop: 0}}>
          {trips === null ? <>
          </>:<>
            {trips.map(t => <>
              {user.id === t.user.id?<>
                <TouchableOpacity key={t.user.id} onPress={() => toTripDetail(t.id)}>
                  <List.Item title={t.title} description={t.created_date?moment(t.created_date).fromNow():""} left={() => <Image style={UserStyle.yourTripImg} source={{uri: t.image}}/>}/>
                </TouchableOpacity>
              </>:<>
              
              </>
              }
            </>)}
          

            
          </>}
          </View>
         
        </View>
      </ScrollView>
    </View>
  )
}

export default Profile
