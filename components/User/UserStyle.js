import { StyleSheet } from "react-native";

export default StyleSheet.create({
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

        
    },
    textHeader: {
        fontSize: 30,
        marginBottom: 15
    },
    avatar: {
        width: 365,
        height: 195, 
        margin: 'auto'
    },
    textInput: {
        backgroundColor: '#EEEEEE',
        marginTop: 15,
        marginLeft: 20,
        marginRight: 20,
        borderWidth: 1,
        borderColor: '#BBBBBB',
        paddingHorizontal: 20,
        outlineColor: 'transparent',
    },
    textInputDescription: {
        backgroundColor: '#EEEEEE',
        marginTop: 15,
        marginLeft: 20,
        marginRight: 20,
        borderWidth: 1,
        borderColor: '#BBBBBB',
        paddingHorizontal: 20,
        outlineColor: 'transparent',
        height: 'auto',
        maxHeight: 72, // Chiều cao tối đa của TextInput
    },
    btnRegister: {
        marginLeft: 20,
        marginRight: 20,
        borderRadius: 10,
        height: 40,
        color: 'white',
        backgroundColor: '#444444'
    },
    btnLogin: {
        marginLeft: 20,
        marginTop: 20,
        marginRight: 20,
        borderRadius: 10,
        height: 40,
        color: 'white',
        backgroundColor: '#444444'
    },
    btnPickAvatar: {
        marginTop: 20,
        marginLeft: 20,
        textAlign: 'center',
        minHeight: 50,
        color: '#444444',
        fontSize: 16
    },
    marginTop: {
        marginTop: 100
    },
    marginTopLogin: {
        marginTop: 150
    },
    btnToRegister: {
        marginTop: 20,
        marginLeft: 20
    },
    bgColor: {
        backgroundColor: '#EEEEEE'
    },
    profileAvatar: {
        width: 300,
        height: 300,
        marginLeft: 60,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#444444',
    },
    headerProfile: {
        fontSize: 30,
        marginTop: -30,
        marginBottom: 10,
        textAlign: 'center',
    },
    nameUser: {
        fontSize: 24,
        marginTop: 16,
        textAlign: 'center'
    },
    yourTripImg: {
        width: 100,
        height: 100,
        marginLeft: 20,
        marginTop: 0,
        borderRadius: 10
    }
})