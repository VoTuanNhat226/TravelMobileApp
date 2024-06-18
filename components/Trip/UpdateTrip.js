import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import APIs, { endpoints } from '../../configs/APIs'

const UpdateTrip = ({route}) => {
    const tripId = route.params?.tripId
    const [isLoading, setIsLoading] = useState(false);
    const [trip, setTrip] = useState(null)

    const loadTrip = async () => {
        try {
            console.log(trip)
            setIsLoading(true)
            let res = await APIs.get(endpoints['tripsDetail'](tripId))
            setTrip(res.data)
            console.log(trip)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }
    useEffect(() => {
        loadTrip()
    }, [tripId])
  return (
    <View>
        
    </View>
  )
}

export default UpdateTrip
