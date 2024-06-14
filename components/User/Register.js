import React, { useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import UserStyle from './UserStyle'
import { Button, HelperText, TextInput, TouchableRipple } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import APIs, { endpoints } from '../../configs/APIs'
import { useNavigation } from '@react-navigation/native'

    const Register = () => {
        const fields = [{
                label: "First name",
                icon: "text",
                field: "first_name"
            },
            {
                label: "Last name",
                icon: "text",
                field: "last_name"
            },
            {
                label: "Email",
                icon: "text",
                field: "email"
            },
            {
                label: "Username",
                icon: "text",
                field: "username"
            },
            {
                label: "Password",
                icon: "eye",
                field: "password",
                secureTextEntry: true
            },
            {
                label: "Confirm password",
                icon: "eye",
                field: "confirm",
                secureTextEntry: true
            }
        ]

    const[user, setUser] = useState({})
    const[loading, setLoading] = useState(false)
    const [err, setErr] = useState(false)
    const nav = useNavigation()

    const picker = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') 
            Alert.alert("TripApp", "Permissions Denied!")
        else {
            let res = await ImagePicker.launchImageLibraryAsync()
            if (!res.canceled)
                change('avatar', res.assets[0])
        }
    }

    const change = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        })
    }

    const register = async () => {
        if (user.password !== user.confirm)
            setErr(true)
        else {
            setErr(false)
            setLoading(true)
            try {
                let form = new FormData()
                for (let f in user)
                    if (f !== 'confirm')
                        if (f === 'avatar')
                            form.append(f, {
                                uri: user.avatar.uri,
                                name: user.avatar.fileName,
                                type: user.avatar.type
                            })
                        else
                            form.append(f, user[f])
                let res = await APIs.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                if (res.status === 201)
                    nav.navigate('Login')
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
    }

  return (
        <View style={[UserStyle.marginTop]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView>
                    <View style={UserStyle.header}>
                        <Text style={UserStyle.textHeader}>Creat Account</Text>
                    </View>
                    {fields.map(f => <TextInput underlineColor='white' style={UserStyle.textInput} value={user[f.field]} secureTextEntry={f.secureTextEntry} onChangeText={t => change(f.field, t)} key={f.field} label={f.label} right={<TextInput.Icon icon={f.icon}/>}></TextInput>)}
                    <TouchableRipple onPress={picker} style={UserStyle.header}>
                        <Text style={UserStyle.btnPickAvatar}>Choose avatar...</Text>
                    </TouchableRipple>
                    {user.avatar && <Image style={UserStyle.avatar} source={{uri: user.avatar.uri}}/>}

                    <HelperText type='error' visible={err}>
                        The confirm passwords do not match, try again.
                    </HelperText>

                    <Button style={UserStyle.btnRegister} loading={loading} onPress={register} mode='contained'  icon='account'>Register</Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
  )
}

export default Register
