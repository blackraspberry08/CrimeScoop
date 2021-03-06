import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Container, Content, Form, Item, Input, Button, Text, View} from 'native-base';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';
import validator from 'validator';
import MainHeader from '../components/Main/Header';
import showToast from '../tools/showToast';
import checkPhoneNumberFormat from '../tools/checkPhoneNumberFormat';
import getFirebaseSignUpErrorMessage from '../tools/getFirebaseSignUpErrorMessage'

export default class SignUp extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      fname: '',
      lname: '',
      confPassword: '',
      phone: '',
      token: ''
    };
  }

  componentDidMount(){
    this._isMounted = true;
    this.getToken()
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleSignUp = () => {
    if (!validator.isEmail(this.state.email)){
      showToast('Email is invalid', 'danger')
      return
    }

    if (this.state.confPassword != this.state.password){
      showToast('Password and Confirm Password does not match', 'danger')
      return
    }

    if (this.state.phone != '' && !checkPhoneNumberFormat(this.state.phone)){
      showToast('Mobile Phone has an invalid format.', 'danger')
      return
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.insertUserToAuth()
      })
      .catch(error => {
        let mes = getFirebaseSignUpErrorMessage(error.code)
        showToast(mes, 'danger')
      })
  }


  async getToken(){
    let token = await AsyncStorage.getItem('fcmToken')
    if (!token) {
      token = await firebase.messaging().getToken();
      if (token) {
        // save sa db?
        await AsyncStorage.setItem('fcmToken', token);
      }
    }
    this.setState({ token })
  }

  insertUserToAuth(){
    firebase.auth().onAuthStateChanged(user => {
      if(user){
        const Users = firebase.firestore().collection('Users')
        const u = {
          uid: user.uid,
          fname: this.state.fname,
          lname: this.state.lname,
          role: 'reporter',
          token: this.state.token,
          phone: this.state.phone,
          avatar: '',
          status: 1
        }

        Users
          .add(u)
          .then(() => {
            this.props.navigation.navigate('AppDrawer')
          })
          .catch(error => {
            showToast(error, 'danger')
          })
      }else{
        showToast('Something Unexpected Happened :C', 'danger')
      }
    })
  }

  goBack(){
    const { goBack } = this.props.navigation;
    goBack()
  }

  render() {
    const s = this.state
    let form = s.email &&
      validator.isEmail(s.email) &&
      s.password &&
      s.fname &&
      s.lname && 
      s.confPassword
    
    return (
      <Container>
        <MainHeader
          title="Sign Up"
          onButtonPress={() => this.goBack()}
          backIcon
        />
        <Content>
          <Form style={styles.form}>
            <View style={{ flexDirection: 'row'}}>
              <Item rounded style={[styles.input, styles.colInput, {marginRight: 8}]}>
                <Input
                  style={ styles.inputFontSize }
                  placeholder='Firstname'
                  onChangeText={fname => this.setState({ fname })}
                  value={this.state.fname}
                />
              </Item>
              <Item rounded style={[styles.input, styles.colInput, {marginLeft: 8}]}>
                <Input
                  style={ styles.inputFontSize }
                  placeholder='Lastname'
                  onChangeText={lname => this.setState({ lname })}
                  value={this.state.lname}
                />
              </Item>
            </View>
            <Item rounded style={styles.input}>
              <Input
                style={ styles.inputFontSize }
                autoCapitalize="none"
                placeholder='Email'
                keyboardType='email-address'
                onChangeText={email => this.setState({ email })}
                value={this.state.email}
              />
            </Item>
            <Item rounded style={styles.input}>
              <Input 
                style={ styles.inputFontSize }
                placeholder='Password' 
                autoCapitalize="none"
                secureTextEntry
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
              />
            </Item>
            <Item rounded style={styles.input}>
              <Input 
                style={ styles.inputFontSize }
                placeholder='Confirm Password' 
                autoCapitalize="none"
                secureTextEntry
                onChangeText={confPassword => this.setState({ confPassword })}
                value={this.state.confPassword}
              />
            </Item>
            <Item rounded style={styles.input}>
              <Input 
                style={ styles.inputFontSize }
                placeholder='Phone'
                keyboardType='numeric'
                onChangeText={phone => this.setState({ phone })}
                value={this.state.phone}
              />
            </Item>
            <Button
              onPress={ this.handleSignUp }
              style={styles.button}
              disabled={ !form }
              block
            >
              <Text>Sign up</Text>
            </Button>
          </Form>
        </Content>
      </Container>
    );
  }
}

// styles
const styles = StyleSheet.create({
  form: {
    marginTop:16,
    marginHorizontal: 24
  },
  input: {
    backgroundColor: '#EFEFEF',
    marginTop: 24
  },
  inputFontSize: {
    fontSize: 16
  },
  colInput: {
    flex: 1
  },
  button: { 
    marginTop: 24,
    marginHorizontal: 64
  }
})
