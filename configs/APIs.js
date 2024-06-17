import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"

const BASE_URL = 'https://sonduy.pythonanywhere.com/'

export const endpoints = {
    'posts': '/posts/',
    'trips': '/trips/',
    'add_trip':'/trips/add_trip/',
    'tripsDetail': (tripId) => `/trips/${tripId}/`,
    'getTripOnwer': (userId) => `/users/${userId}/get_trips/`,
    'places': '/places/',
    'comments': (tripId) => `/trips/${tripId}/get_comments/`,
    'postComment': (tripId) => `/trips/${tripId}/comments/`,
    'register': '/users/',
    'login': '/o/token/',
    'current_user': '/users/current_user/',
    'placeDetail': (placeID) => `/places/${placeID}/`,
    'like': (tripId) => `/trips/${tripId}/like/`,
    'check_liked' : (tripId) => `/trips/${tripId}/check_liked/`,
    'ratings' :(tripId) => `trips/${tripId}/ratings/`,
    'report': (userId) => `/users/${userId}/report/`
}   

export const authAPI = (accessToken) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${accessToken===null?AsyncStorage.getItem("acess-token"):accessToken}`
            // 'Authorization': `Bearer ${accessToken}`
        }
    });
}


export default axios.create({
    baseURL: BASE_URL
})