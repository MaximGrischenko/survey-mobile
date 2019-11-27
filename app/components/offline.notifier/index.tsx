import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {connectionSelector} from "../../redux/modules/connect";
import {showAlert} from "../../redux/modules/dialogs";
import {Text} from "react-native";

interface IMapProps {
    connection: boolean;
    showAlert: Function;
}

class Notifier extends Component<IMapProps> {
    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        if(!nextProps.connection) {
            this.props.showAlert('Offline mode enabled: connect to the Internet to get images and sync changes');
        }
    }

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <Text style={{paddingTop: 105}}></Text>
        );
    }
}

const mapStateToProps = (state: any) => ({
    connection: connectionSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showAlert,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Notifier);