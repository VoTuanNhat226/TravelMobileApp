import React, { useContext, useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from 'react-native'
import { MyDispatchContext, MyUserContext } from '../../configs/Context'
import { Button, List, TouchableRipple } from 'react-native-paper'
import UserStyle from './UserStyle'
import TripStyle from '../Trip/TripStyle'
import APIs, { endpoints } from '../../configs/APIs'
import TripDetailStyle from '../TripDetail/TripDetailStyle'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'

const Profile = () => {
    const user = useContext(MyUserContext)
    const dispatch = useContext(MyDispatchContext)
    const [trips, setTrips] = useState([])
    const nav = useNavigation()

    const loadTrip = async () => {
      let res = await APIs.get(endpoints['trips'])
      setTrips(res.data.results)
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
        <View>
            <Image style={UserStyle.profileAvatar} source={{uri: user.avatar}}/>
        </View>
        <Text style={UserStyle.nameUser}>{user.last_name} {user.first_name}</Text>
        <View>
          <Button icon="logout" onPress={() => dispatch({"type": "logout"})}>ĐĂNG XUẤT</Button>
        </View>
        <View>
          <Text style={[TripDetailStyle.title, {marginLeft:20} ]}>Your trip:</Text>
          {trips === null ? <></>:<>
            {trips.map(t => <>
              {user.id === t.user.id?<>
                <TouchableRipple key={t.id} onPress={() => toTripDetail(t.id)}>
                  <List.Item title={t.title} description={t.created_date?moment(t.created_date).fromNow():""} left={() => <Image style={UserStyle.yourTripImg} source={{uri: t.image}}/>}/>
                </TouchableRipple>
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
