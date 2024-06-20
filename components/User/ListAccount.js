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

const ListAccount = () => {
  const user = useContext(MyUserContext)
//   const dispatch = useContext(MyDispatchContext)
  const [reports, setReports] = useState([])
//   const nav = useNavigation()
  const loadReport = async (userId) => {
    try {
      let acessToken = await AsyncStorage.getItem("acess-token")
      let res = await authAPI(acessToken).get(endpoints['account_list'])
      setReports(res.data)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    loadReport()
  },[])

//   const toTripDetail = (tripId) => {
//     nav.navigate('Detail', {'tripId': tripId})
//   }

const handleBlockAccount = async (userId) => {
    try {
     Alert.alert(
         'Warning!',
         'Are you sure you want to block this accounnt?',
         [
           { text: 'Cancel'} ,
           { text: 'OK', onPress: async () => {
            try{
                let acessToken = await AsyncStorage.getItem("acess-token")
                let res = await authAPI(acessToken).get(endpoints['block_account'](userId))
                if(res.status == 200) {
                     Alert.alert('Notification', 'Account is blocked !')
                }
            }catch(error){
                if (error.response) {
                    const res = error.response;
                    if (res.status === 400) {
                      if (res.data.message === 'No blocked') {
                        Alert.alert('Notification', 'Not enough conditions to block');
                      } else if (res.data.message === 'Already blocked') {
                        Alert.alert('Notification', 'Account has already been blocked');
                      }
                    } else {
                      Alert.alert('Error', 'An unexpected error occurred');
                    }
                  } else {
                    Alert.alert('Error', 'An unexpected error occurred');
                  }
                  console.error(error);
            }
        
            //  else if (res.data.message === 'No blocked') {
            //     Alert.alert('Notification', 'Not enough conditions to block')
            //  } 
            //  else if (res.data.message === 'Already blocked') {
            //     Alert.alert('Notification', 'Account has already been blocked')
            //  }
           
           }},
         ],
         { cancelable: false }
       );
         
    } catch (error) {
         console.error(error)
    }
 };
  return (
    <View style={UserStyle.marginTop}>
      <View>
          <Text style={UserStyle.headerProfile}>List Of Reported Accounts</Text>
      </View>
      <ScrollView>
      {reports.map(r => (
                   
                        <List.Item key={r.id} title={`Reason: ${r.reason}`} description={r.created_date?moment(r.created_date).fromNow():""} 
                        left={() => <Image style={TripStyle.imgReport} source={{uri: r.reported_user.avatar}}/>}
                        right={() => 
                        <TouchableOpacity style={{marginTop: 10}} onPress={() => handleBlockAccount(r.reported_user.id)}> 
                            <Icon 
                            source="alert"
                            size={20}
                            color='red'/>
                        </TouchableOpacity>
                        }
                        />
                    ))
                }
      </ScrollView>
    </View>
  )
}

export default ListAccount
