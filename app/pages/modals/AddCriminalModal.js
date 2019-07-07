import React, { Component } from 'react';
import { isArray, isObject } from 'lodash'
import { Modal, StyleSheet, TouchableOpacity, TouchableHighlight } from 'react-native';
import { Thumbnail, Content, Form, Item, Input, Text, View, Header, Body, Left, Right, Title, Button, Icon, Container } from 'native-base';
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-picker';
import modalStyle from '../../styles/modal';
import uploadMedia from '../../tools/uploadMedia';

export default class AddCriminalModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fname: '',
            lname: '',
            avatar: '',
            imageName: '',
            crimes: [],
            holder: '',
            inputCrime: ['input-0'],
            criminal: {}
        };
    }

    componentDidMount() {

        console.log(this.props.criminal);
        if ((isObject(this.props.criminal) && this.props.criminal) || (isArray(this.props.criminal) && this.props.criminal.length > 0)) {
            this.setState({ criminal: this.props.criminal })
            this.setState({ fname: this.props.criminal.data.fname })
            this.setState({ lname: this.props.criminal.data.lname })
            this.setState({ crimes: this.props.criminal.data.crimes })
            this.setState({ avatar: this.props.criminal.data.upload })
            if (this.props.criminal.data.crimes.length > 0) {
                let newInput = `input-${this.state.inputCrime.length}`;
                this.setState(prevState => ({ inputCrime: prevState.inputCrime.concat([newInput]) }));
                console.log(this.state.inputCrime)
                this.state.crimes.push(this.state.holder.toString());
            }
        }
    }

    selectPhotoTapped = () => {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true,
            },
        };

        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled photo picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let uri = { uri: response.uri };
                this.setState({ avatar: uri });
                this.setState({ imageName: response.fileName });
            }
        });
    }

    resetValues = () => { // before closing, reset the values
        this.setState({ fname: '' })
        this.setState({ lname: '' })
        this.setState({ avatar: '' })
        this.setState({ email: '' })
        if (this.props.mode == 'edit') {
            this.props.changeEditCriminalVisibility(false);
        } else {
            this.props.changeAddCriminalVisibility(false)
        }
    }

    addInputCrime = () => {
        let newInput = `input-${this.state.inputCrime.length}`;
        this.setState(prevState => ({ inputCrime: prevState.inputCrime.concat([newInput]) }));
        this.state.crimes.push(this.state.holder.toString());
        this.setState({ holder: '' })
    }

    addNotoriousCriminal = () => {
        this.state.crimes.push(this.state.holder.toString());
        let criminal = {
            fname: this.state.fname,
            lname: this.state.lname,
            crimes: this.state.crimes,
            addedAt: firebase.firestore.Timestamp.fromDate(new Date()),
            status: 1,
        }
        if (this.state.avatar == '') {
            criminal['upload'] = ''
            if (this.props.mode == 'edit') {
                firebase.firestore().collection('NotoriousCriminals').doc(this.state.criminal.id).update(criminal)
            } else {
                firebase.firestore().collection('NotoriousCriminals').add(criminal)
            }
        } else {
            // console.log(this.state.avatar, this.state.imageName);
            uploadMedia(this.state.avatar.uri, this.state.imageName)
                .then(e => {
                    // criminal.avatar = e
                    console.log(e);
                    criminal['upload'] = e
                    if (this.props.mode == 'edit') {
                        firebase.firestore().collection('NotoriousCriminals').doc(this.state.criminal.id).update(criminal)
                    } else {
                        firebase.firestore().collection('NotoriousCriminals').add(criminal)
                    }
                })
        }

        this.props.onReport()
        if (this.props.mode == 'edit') {
            this.props.changeEditCriminalVisibility(false);
        } else {
            this.props.changeAddCriminalVisibility(false)
        }
    }

    render() {
        let defaultAvatar = "../../assets/user-placeholder.jpg"
        let avatar = <Thumbnail large source={require(defaultAvatar)} />

        if (this.state.avatar != '') {
            avatar = <Thumbnail large source={this.state.avatar} />
        } else {
            avatar = avatar //use default
        }

        const s = this.state
        let form =
            s.fname &&
            s.lname

        let mode = 'Add'
        if (this.props.mode == 'edit') {
            mode = 'Edit'
        } else {
            mode = 'Add'
        }

        renderCrimes = this.state.inputCrime.map((crime, key) => {
            return (
                <View style={{ flexDirection: 'row' }} key={key}>
                    <Item
                        rounded
                        style={[styles.input, styles.colInput, { marginRight: 8 }]}
                    >
                        <Input
                            autoFocus={true}
                            style={styles.inputFontSize}
                            placeholder='Crime'
                            onChangeText={crimes => { this.setState({ holder: crimes }) }}
                            value={this.state.crimes[key] == '' ? undefined : this.state.crimes[key]}
                        />
                    </Item>
                </View>
            )
        })
        console.log(this.props.mode);

        return (
            <Container>
                <Content contentContainerStyle={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <View style={{ backgroundColor: '#fff', marginHorizontal: 24, borderRadius: 10 }}>
                        <Header>
                            <Left>
                                <Icon
                                    name='person'
                                    style={{ color: '#fff' }}
                                />
                            </Left>
                            <Body>
                                <Title>{mode} Criminal</Title>
                            </Body>
                            <Right style={{ border: 1 }} />
                        </Header>
                        <Form style={[styles.form, { paddingVertical: 32 }]}>
                            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                                <TouchableOpacity onPress={this.selectPhotoTapped}>
                                    {avatar}
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Item
                                    rounded
                                    style={[styles.input, styles.colInput, { marginRight: 8 }]}
                                >
                                    <Input
                                        autoFocus={true}
                                        style={styles.inputFontSize}
                                        placeholder='Firstname'
                                        onChangeText={fname => { this.setState({ fname }) }}
                                        value={this.state.fname}
                                    />
                                </Item>
                                <Item
                                    rounded
                                    style={[styles.input, styles.colInput, { marginRight: 8 }]}
                                >
                                    <Input
                                        autoFocus={true}
                                        style={styles.inputFontSize}
                                        placeholder='Lastname'
                                        onChangeText={lname => { this.setState({ lname }) }}
                                        value={this.state.lname}
                                    />
                                </Item>
                            </View>
                            <Icon name='add' style={{ color: 'green', paddingTop: 10 }} onPress={() => this.addInputCrime()} />
                            <Text>Click to add crime</Text>
                            {renderCrimes}
                            {this.props.mode == 'edit' && (
                                <View style={{ flexDirection: 'row' }}>
                                    <Item
                                        rounded
                                        style={[styles.input, styles.colInput, { marginRight: 8 }]}
                                    >
                                        <Input
                                            autoFocus={true}
                                            style={styles.inputFontSize}
                                            placeholder='Crime'
                                            onChangeText={crimes => { this.setState({ holder: crimes }) }}
                                        />
                                    </Item>
                                </View>
                            )}
                        </Form>
                        <View style={modalStyle.buttonView}>
                            <TouchableHighlight
                                onPress={() => this.resetValues()}
                                style={[modalStyle.touchableHighlight, { borderBottomLeftRadius: 10, borderRightColor: 'grey', borderRightWidth: 1 }]}
                                underlayColor={'#f1f1f1'}
                            >
                                <Text style={[modalStyle.textModal, { color: 'blue' }]}>Cancel</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                disabled={!form}
                                onPress={() => this.addNotoriousCriminal()}
                                style={[modalStyle.touchableHighlight, { borderBottomRightRadius: 10 }]}
                                underlayColor={'#f1f1f1'}
                            >
                                <Text style={[modalStyle.textModal, { color: !form ? '#ccc' : 'blue' }]}>{mode} Criminal</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Content >
            </Container>

        );
    }
}


const styles = StyleSheet.create({
    form: {
        marginHorizontal: 24
    },
    input: {
        backgroundColor: '#EFEFEF'
    },
    inputFontSize: {
        fontSize: 16
    },
    colInput: {
        flex: 1
    }
})