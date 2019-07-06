import React, { Component } from 'react';
import { Container, Content, List, ListItem, Thumbnail, Text, Left, Body, Right, Button, Icon } from 'native-base';
import { Modal, RefreshControl } from 'react-native'
import firebase from 'react-native-firebase'
import getDataWithProps from '../../tools/firestore/getDataWithProps';
import ViewModal from './../modals/ViewModal';
import ConfirmModal from './../modals/ConfirmModal';

// Retrieve Firebase Messaging object.
// const messaging = firebase.messaging();

export default class BogusReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reportsByBogus: [],
            selectedReport: [],
            isViewModalVisible: false,
            isConfirmModalVisible: false,
            refreshing: false,
        }
        this.getReportsByBogus = this.getReportsByBogus.bind(this);
    }
    componentDidMount() {
        this.getReportsByBogus();
    }

    changeViewModalVisibility = (bool) => {
        this.setState({ isViewModalVisible: bool });
    }

    changeConfirmModalVisibility = (bool) => {
        this.setState({ isConfirmModalVisible: bool });
    }

    getReportsByBogus = () => {
        let uid = ''
        let currentUser = {}
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                uid = user.uid
                getDataWithProps('Users', { uid: uid }).then(res => {
                    currentUser = res[0].data
                    getDataWithProps('Reports', { status: 3 }).then(res => {
                        if(currentUser.role == 'brgy_officer' || currentUser.role == 'police_officer'){
                            let reports = []
                            res.forEach(report => {
                                // check if the barangay of report is in brgys of user
                                if(currentUser.brgys.indexOf(report.data.barangay) > -1){
                                    reports.push(report)
                                }
                            })
                            this.setState({ reportsByBogus: reports })
                        }else{
                            this.setState({ reportsByBogus: res })
                        }
                    })
                })
            }
        });
    }

    getSelectedReport(data) {
        this.setState({ selectedReport: data })
    }

    onRefresh = async () => {
        await this.getReportsByBogus();
        await this.setState({ refreshing: false });
    }

    render() {
        let reports = this.state.reportsByBogus;
        return (
            <Container>
                <Content
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={() => this.onRefresh()}
                        />
                    }>
                    <List>
                        {

                            reports.map((report, key) => {
                                // console.log(report.data.brgyOfficer);
                                return (
                                    <ListItem thumbnail button={true} key={key} onPress={() => [this.changeViewModalVisibility(true), this.getSelectedReport(report.data)]}>
                                        <Left>
                                            {report.data.upload == '' ? <Thumbnail square source={require('../../assets/placeholder-img.jpg')} />
                                                : <Thumbnail square source={{ uri: report.data.upload }} />}
                                        </Left>
                                        <Body>
                                            <Text>{report.data.crime.name}</Text>
                                            <Text note numberOfLines={1}>{report.data.location}</Text>
                                            <Text note numberOfLines={2}>{report.data.reportedBy.fname} {report.data.reportedBy.lname}</Text>
                                            <Text note numberOfLines={3}>{new Date(report.data.reportedAt.toDate()).toDateString()}</Text>
                                        </Body>
                                        <Right>
                                           
                                        </Right>
                                    </ListItem>
                                );
                            })

                        }
                    </List>
                    <Modal
                        transparent={true}
                        visible={this.state.isViewModalVisible}
                        onRequestClose={() => this.changeViewModalVisibility(false)}
                        animationType='fade'
                    >
                        <ViewModal 
                            changeModalVisibility={this.changeViewModalVisibility} 
                            report={this.state.selectedReport}
                        />
                    </Modal>
                    <Modal
                        transparent={true}
                        visible={this.state.isConfirmModalVisible}
                        onRequestClose={() => this.changeConfirmModalVisibility(false)}
                        animationType='fade'
                    >
                        <ConfirmModal 
                            changeModalVisibility={this.changeConfirmModalVisibility} 
                            report={this.state.selectedReport}
                            onReport={this.onRefresh}
                        />
                    </Modal>
                </Content>
            </Container >
        );

    }


}