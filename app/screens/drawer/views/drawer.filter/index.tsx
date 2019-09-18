import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import moment from "moment";
import {changeControls, moduleName} from "../../../../redux/modules/map";
import {Text, TouchableOpacity, View, StyleSheet} from "react-native";

interface IMapProps {
    changeControls: Function,
    dateFilter: any,
}

class DrawerFilter extends Component<IMapProps> {
    state = {
        dates: [
            {
                title: 'All',
                value: 'All',
            },
            {
                title: 'Today ',
                subtitle: moment().format('l'),
                value: moment().utc().toString()
            },
            {
                title: 'Last 7 days ',
                subtitle: moment().subtract(7, 'days').format('l'),
                value: moment().subtract(7, 'days').utc().toString()
            },
            {
                title: 'Last 30 days ',
                subtitle: moment().subtract(30, 'days').format('l'),
                value: moment().subtract(30, 'days').utc().toString()
            }
        ]
    };

    private onChange = (name, value) => {
        this.props.changeControls({name, value});
    };

    render() {
        const {dates} = this.state;
        const {dateFilter} = this.props;
        return (
            <View style={localStyles.container}>
                <Text style={localStyles.title}>Record Updated:</Text>
                <View>
                    {
                        dates.map((el: any) => {
                            return (
                                <TouchableOpacity key={el.value}
                                                  onPress={() => this.onChange('dateFilter', el.value)}>
                                    {
                                        dateFilter === el.value ? (
                                            <View style={localStyles.radioBtn}>
                                                <View style={localStyles.checkedCircle}>
                                                    <View style={localStyles.checkedInnerCircle}/>
                                                </View>
                                                <Text style={localStyles.selected}>{el.title} {el.subtitle}</Text>
                                            </View>
                                        ) : (
                                            <View style={localStyles.radioBtn}>
                                                <View style={localStyles.circle} />
                                                <Text style={localStyles.item}>{el.title} {el.subtitle}</Text>
                                            </View>
                                        )
                                    }
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </View>
        );
    }
}

const localStyles = StyleSheet.create({
    container: {
        paddingTop: 30,
        paddingBottom: 30,
    },
    title: {
        marginBottom: 20
    },
    radioBtn: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    circle: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        borderWidth: 1,
        borderColor: '#bcbcbc',
        marginRight: 10,
    },
    checkedCircle: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: '#315581',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    checkedInnerCircle: {
        width: 11,
        height: 11,
        borderRadius: 5.5,
        backgroundColor: '#fff',
    },
    item: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 0.7,
    },
    selected: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 1,
    },
});

const mapStateToProps = (state: any) => ({
    dateFilter: state[moduleName].dateFilter
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DrawerFilter);