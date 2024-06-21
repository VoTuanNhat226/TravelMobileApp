import React, { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Image, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import Style from '../../Style/Style'
import APIs, { endpoints, fetchPlace } from '../../configs/APIs'
import { Chip, List, Searchbar } from 'react-native-paper'
import moment from 'moment';
import PlaceStyle from './PlaceStyle'
import { useRoute } from '@react-navigation/native'

const Places = ({route}) => {
    const placeId = route.params?.placeId
    const [places, setPlaces] = useState([])
    const [loading, setLoading] = useState(false)
    const [q, setQ] = useState("")
    const [placeID, setPlaceID] = useState("")
    const [page, setPage] = useState(1);


    const loadPlaces = async () => {
        try {
            const placeDetail = await APIs.get(endpoints['placeDetail'](placeId));
            setPlaces([placeDetail])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPlaces();
    }, [])


    // const toPlaceDetail = (placeId) => {
    //     navigation.navigate('PlaceDetail', {'placeId': placeId})
    // }

    const search = (value, callback) => {
        setPage(1);
        callback(value);
    }

    return (
        <View>
            <View>
                {places===null?<ActivityIndicator/>:<>
                {places.map(p => <Chip style={PlaceStyle.searchInput} key={p.id} onPress={() => search(p.id, setPlaceID)}></Chip>)}
                </>}
            </View>
            <View>
                <Searchbar style={PlaceStyle.searchInput} placeholder='Nhập từ khóa...' onChangeText={setQ} value={q}/>
            </View>
                {<ActivityIndicator/>}
                {places.map(t => <TouchableOpacity key={t.id}>
                                    <List.Item title={t.title} description={t.created_date?moment(t.created_date).fromNow():""} left={() => <Image style={PlaceStyle.img} source={{uri: t.image}}/>}/>
                                </TouchableOpacity>)}
                {<ActivityIndicator/>}
        </View>
    )
}

export default Places