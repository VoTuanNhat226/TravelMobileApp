import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"

const BASE_URL = 'https://sonduy.pythonanywhere.com/'

export const endpoints = {
    'posts': '/posts/',
    'trips': '/trips/',
    'tripsDetail': (tripId) => `/trips/${tripId}/`,
    'comments': (tripId) => `/trips/${tripId}/get_comments/`,
    'postComment': (tripId) => `/trips/${tripId}/comments/`,
    'register': '/users/',
    'login': '/o/token/',
    'current_user': '/users/current_user/',
    'placeDetail': (placeID) => `/places/${placeID}/`
}

export const authAPI = (accessToken) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${accessToken===null?AsyncStorage.getItem("acess-token"):accessToken}`
        }
    });
}


export default axios.create({
    baseURL: BASE_URL
})