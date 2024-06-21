import React, { useContext, useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Image, ScrollView, RefreshControl, TouchableOpacity, Alert} from 'react-native'
import Style from '../../Style/Style'
import TripStyle from './TripStyle'
import APIs, { endpoints } from '../../configs/APIs'
import { Button, Chip, List, Searchbar } from 'react-native-paper'
import moment from 'moment';
import { MyUserContext } from '../../configs/Context'

const Trip = ({navigation}) => {
    const [posts, setPosts] = useState(null); 
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("")
    const [postID, setPostID] = useState("")
    const [page, setPage] = useState(1);
    const user = useContext(MyUserContext)
    const [searchValue, setSearchValue] = useState('');

    const loadPosts = async () => {
        try {
            let res = await APIs.get(endpoints['posts'])
            setPosts(res.data.results)
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        loadPosts();
    }, [])
    
    const loadTrips = async () => {
        if(page > 0) {
            setLoading(true)
            let url = `${endpoints['trips']}?q=${q}&post_id=${postID}&page=${page}`;
            try {
                let res = await APIs.get(url)
                if (page === 1)
                setTrips(res.data.results)
                 else
                setTrips(current => {
                    return [...current, ...res.data.results]
                    })
                if (res.data.next === null)    
                    setPage(0)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }   
    }
    useEffect(() => {
        loadTrips()
    }, [q, postID, page, trips])
    
    const isCloseToBottom = ({layoutMeasurement,contentOffset, contentSize}) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    }

    const loadMoreTrip = ({nativeEvent}) => {
        if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
            setPage(page + 1)
        }
    }

    const search = (value, callback) => {
        setPage(1);
        callback(value);
    }

    

    const handleSearch = async () => {

        let res = await APIs.get(`${endpoints['trips']}?title=${q}`);

        // Thực hiện các bước tìm kiếm dựa trên giá trị (value) được truyền vào
        // Ví dụ: Gọi API để tìm kiếm các trip theo tên
        // ...
      
        // Cập nhật state trips với kết quả tìm kiếm
        setTrips(res.data.results); // searchResults là kết quả tìm kiếm (danh sách các trip) từ API hoặc xử lý logic tìm kiếm
      }

    useEffect(() => {
        handleSearch()
    }, [q])

    const handleHideTrip = async (trip) => {
        let res = await APIs.get(endpoints['hide_trip'](trip.id))
    }
    useEffect(() => {
        trips.forEach((trip) => {
          if (trip.active === true) {
            handleHideTrip(trip);
          }
        });
      }, [trips]);
    
    const toTripDetail = (tripId) => {
        navigation.navigate('Detail', {'tripId': tripId})
    }

    const toAddTrip = () => {
       try {
        if(user) {
            navigation.navigate('AddTrip');
        }
        else {
            Alert.alert(
            'Notification',
            'You need to login',
            [
                {
                text: 'OK',
                onPress: () => navigation.navigate('Login'),
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
            {/* <View>
                {trips===null?<></>:<>
                    {trips.map((p) => <Chip style={TripStyle.postChip} key={p.id}></Chip>)}
                </>}
            </View> */}
            <TouchableOpacity onPress={toAddTrip} style={TripStyle.addTrip}>
                   {/* <Text style={{color: 'white', margin: 'auto', fontSize: 17}}>Create a trip</Text> */}
                   <Button icon='plus'><Text style={{color: 'white', margin: 'auto'}}>Create a trip</Text></Button>
            </TouchableOpacity>
            <View>
                <Searchbar style={TripStyle.searchInput} placeholder='Enter keywords...' onChangeText={setQ} value={q}/>
            </View>
            <ScrollView onScroll={loadMoreTrip} contentInsetAdjustmentBehavior="automatic" style={{marginBottom: 130}}>
                <RefreshControl onRefresh={() => loadTrips()}/>
                {loading && <ActivityIndicator/>}
                {trips.map(t => t.active === true ?(
                    <TouchableOpacity key={t.id} onPress={() => toTripDetail(t.id)}>
                        <List.Item title={t.title} description={t.created_date?moment(t.created_date).fromNow():""} left={() => <Image style={TripStyle.img} source={{uri: t.image}}/>}/>
                    </TouchableOpacity>):null)
                }
                {loading && page > 1 && <ActivityIndicator/>}
            </ScrollView>
        </View>
    )
}

export default Trip

