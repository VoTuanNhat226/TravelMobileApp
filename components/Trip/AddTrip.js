import React, { useContext, useEffect, useState } from 'react'
import { View, Text} from 'react-native'
import TripStyle from './TripStyle'
import { useNavigation } from '@react-navigation/native'
import UserStyle from '../User/UserStyle'
import { TextInput } from 'react-native-paper'
import { MyUserContext } from '../../configs/Context'
import APIs, { endpoints } from '../../configs/APIs'
import { Picker } from 'react-native-web'

const AddTrip = () => {
    const fields = [{
            label: "Title",
            icon: "text",
            field: "title"
        },
        {
            label: "Decription",
            icon: "text",
            field: "decription"
        },
        {
            label: "Time start",
            icon: "text",
            field: "time_start"
        },
        {
            label: "Time finish",
            icon: "text",
            field: "time_finish"
        },  
    ]

    const [user, setUser] = useState({})
    const [posts, setPosts] = useState([])
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(false)
    const nav = useNavigation()
    const userAuth = useContext(MyUserContext)

    const change = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        })
    }

    const loadPost = async () => {
        try {
          setLoading(true)  
          let res = await APIs.get(endpoints['posts'])
          setPosts(res.data.results)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        loadPost()
    }, [])


  return (
    <View>
        <Text style={TripStyle.headerTitle}>Create a trip</Text>
        <View>
            {fields.map(f => <TextInput value={user[f.field]} style={UserStyle.textInput} onChangeText={t => change(f.field, t)} key={f.field} label={f.label} underlineColor='white'/>)}
        </View> 
    </View>
  )
}

export default AddTrip
