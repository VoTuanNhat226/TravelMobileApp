import React from "react";
import { Profiler, useContext, useReducer } from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "react-native-paper";

import Trip from "./components/Trip/Trip";
import AddTrip from "./components/Trip/AddTrip";
import TripDetail from "./components/TripDetail/TripDetail";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Profile from "./components/User/Profile";
import Places from "./components/Places/Places"

import { MyDispatchContext, MyUserContext } from "./configs/Context";
import MyUserReducer from "./configs/Reducers";

const Stack = createStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator initialRouteName="Trip" screenOptions={{headerStyle: {backgroundColor: '#EEEEEE'}}} >
      <Stack.Screen name="Trip" component={Trip}/>
      <Stack.Screen name="Detail" component={TripDetail} />
      <Stack.Screen name="AddTrip" component={AddTrip} />
      <Stack.Screen name="Login" component={Login} />     

    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const MyTab = () => {
  const user = useContext(MyUserContext);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Ẩn header mặc định của tab
      }}
    >
      <Tab.Screen name="Home" component={MyStack} options={{ title: "Home", tabBarIcon: () => <Icon size={30} color="#444444" source="home" />}} />
      {user === null?<>
        <Tab.Screen name="Register" component={Register} options={{ title: "Register", tabBarIcon: () => <Icon size={30} color="#444444" source="account" />}} />
        <Tab.Screen name="Login" component={Login} options={{title: "Login", tabBarIcon: () => <Icon size={30} color="#444444" source="login" />}} />
      </>:<>
        <Tab.Screen name="Profile" component={Profile} options={{ title: "Profile", tabBarIcon: () => <Icon size={30} color="#444444" source="account" />}} />
      </>}
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  return (
    <NavigationContainer>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <MyTab />
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </NavigationContainer>
  );
}
