import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from 'react-native'
import APIs, { endpoints } from '../../configs/APIs'


const PlaceDetail = ({route}) => {
    const placeId = route.params?.placeId
    const [place, setPlace] = useState({})

    const loadPlaceDetail = async () => {
        try {
            let res = await APIs.get(endpoints['placeDetail'](placeId))
            setPlace(res.data)
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        loadPlaceDetail()
    }, [placeId])
    return (
    <View>
        <View>
            <Image style={{width: 370, height: 200, margin: 20}} source={{uri: place.image}}/>
            <Text style={{margin: 'auto', fontSize: 26, fontWeight: 'bold'}}>{place.title}</Text>
            <Text style={{marginLeft: 20, marginTop: 30, fontSize: 20, fontWeight: 'bold'}}>Open time: {place.open_time}</Text>
            <Text style={{marginLeft: 20, marginTop: 20, marginBottom: 0 ,fontSize: 20, fontWeight: 'bold'}}>Price: {place.price}</Text>
            <ScrollView>
                <Text style={{marginLeft: 20, marginTop: 20, fontSize: 20, fontWeight: 'bold'}}>Description: {place.content}</Text>
            </ScrollView>
        </View>
    </View>
  )
}

export default PlaceDetail
