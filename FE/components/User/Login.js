import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

import { useNavigation } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, Touchable, View } from 'react-native'
import { Button, TextInput, TouchableRipple } from 'react-native-paper'

import UserStyle from './UserStyle'
import APIs, { endpoints, authAPI } from '../../configs/APIs'
import { MyDispatchContext } from '../../configs/Context'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../configs/firebase'
import { LogBox } from 'react-native';

const Login = () => {
    LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
    LogBox.ignoreAllLogs();//Ignore all log notifications

    const fields = [
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
        }
    ]

    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(false)
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation()

    const change = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        })
    }

    const login = async () => {
        setLoading(true)
        try {
            let res = await APIs.post(endpoints['login'], {
                ...user,
                'client_id': 'JHsccLJ6f0ASvJ1j26XRsYZVOgHXly61qsmrpCy2',
                'client_secret': 'xoZdUv5TDOBCtTw9p10TfWVfuqm9Ru9to2QKtmkZrPEjBtLlgH3VnbzJbpSmP371w0oH88Lje5Qqne0sxHTt0Bj6bxov5ZWUNObsh2DSxiKKptSuQjfIzzN8XRXiaSBo',
                'grant_type': 'password'
            })
            console.info(res.data)
            await AsyncStorage.setItem('acess-token', res.data.access_token)

            

            setTimeout(async () => {
                let user = await authAPI(res.data.access_token).get(endpoints['current_user']);
                // console.info(user.data);
                // console.log(user.data.username, user.data.password)
                await signInWithEmailAndPassword(auth, user.data.username, "123456")
                dispatch({
                    "type": "login",
                    "payload": user.data
                });
                nav.navigate("Trip");
            }, 100);
        } catch (error) {
            console.error(error)
            Alert.alert('Warning', "Wrong username or password, or maybe you've been ban")
        } finally {
            setLoading(false)
        }
    }

    const toRegister = () => {
        nav.navigate('Register')
    }


  return (
    <View style={UserStyle.bgColor}>
        <View style={UserStyle.marginTopLogin}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{height: 1000}}>
                <View style={UserStyle.header}>
                    <Text style={UserStyle.textHeader}>Login</Text>
                </View>
                <View>
                    {fields.map(f => <TextInput style={UserStyle.textInput} value={user[f.field]} secureTextEntry={f.secureTextEntry} onChangeText={t => change(f.field, t)} key={f.field} label={f.label} right={<TextInput.Icon icon={f.icon}/>} underlineColor='white'/>)}
                </View>

                <TouchableRipple onPress={toRegister}>
                    <Text style={UserStyle.btnToRegister}>Don't have an account? Let's register</Text>
                </TouchableRipple>

                <Button loading={loading} onPress={login} mode='contained' icon='account' style={UserStyle.btnLogin}>Login</Button>
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
    </View>
  )
}

export default Login
