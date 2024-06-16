import { StyleSheet } from "react-native";


export default StyleSheet.create({
    img: {
        width: 370,
        height: 200,
        borderRadius: 10
    },
    margin: {
        margin: 20,
        marginTop: 0
    },
    title: {
        marginTop: 10,
        fontSize: 26
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 60,
        marginTop: 15,
        marginRight: 5
    },
    parAvatar: {
        width: 30,
        height: 30,
        borderRadius: 30,
        marginTop: 15,
        marginBottom: 5,
        marginRight: 5

    },
    flex: {
        // alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    name: {
        marginTop: 20
    },
    parName: {
        marginTop: 10
    },
    line: {
        width: 370,
        backgroundColor: '#444444',
        height: 3,
        marginTop: 20,
        marginBottom: 5
    },
    cmtInput: {
        marginTop: 10,
        paddingLeft: 15,
        width: 300,
        height: 40,
        borderWidth: 1,
        borderRadius: 5
    },
    cmtSend: {
        marginTop: 10,
        marginRight: 5,
        paddingTop: 10,
        width: 60,
        height: 40,
        backgroundColor: '#BBBBBB',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#666666'
    },
    cmtAvatar: {
        width: 40,
        height: 40,
        borderRadius: 40,
        marginTop: 15,
        marginBottom: 5,
        marginRight: 5
    },
    cmtFlex: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cmtName: {
        fontWeight: 'bold',
        marginTop: 8
    },
    cmtContent: {
        marginTop: 3
    },
    cmtCreateDate: {
        marginLeft: 10,
        marginTop: 8
    },
    cmtCheck: {
        position: 'absolute',
        top: -40,
        right: 10,
        width: 30,
        height: 30,
    },

    option: {
        fontSize: 20,
        width: 100,
        height: 40,
        marginTop: 20
    },
    icon : {
        
        marginLeft: 20
    },
    like : {
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: 'cyan',
        width: 60,
        height: 40,
        textAlign: 'center'
    }
})