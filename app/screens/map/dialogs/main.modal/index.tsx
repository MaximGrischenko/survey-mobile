import React, {Component} from 'react';

import {Upload, Pole, Parcel, Segment, Station, Category, Project} from "../../../../entities";
import {segment_statuses, parcel_statuses, segment_operation_type, checkError} from "../../../../redux/utils";

import {Form, Field} from 'react-native-validate-form';
import {View, Text, Platform, TouchableOpacity, StyleSheet, TextInput, Slider, ScrollView} from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import {InputField, required} from "../../../../components/inputs/field.input";
import {PrimaryButton} from "../../../../components/buttons/primary.button";

interface IMapProps {
    isAdmin: any,
    itemsList: any,
    position: any,
    selectedItem: any,
    location: any,
    categories: Array<Category>,
    projects: Array<Project>,
    tempPosition: Array<any>,
    onFinishEditItem: Function,
    changeControls: Function,
    editItem: Function,
    onDeleteItem: Function,
    onAddItem: Function,
    setDialogSaveButton: Function,
    showDialogContent: Function
}

interface IMapState {
    uploads: Array<Upload>,
    errors: any,
    canDelete: boolean,
    __pending: boolean
}

export const TYPES = {
    NONE: -1,
    PARCEL: 1,
    POLE: 2,
    STATION: 3,
    SEGMENT: 4,
    POI: 5,
};

export default class MainModalDialog extends Component<IMapProps, IMapState> {
    protected editTitle: boolean = true;
    protected title: string = '';
    protected type: number = TYPES.NONE;
    private editForm: any;
    static defaultProps: {
        categories: [],
        projects: [],
        itemsList: null,
        position: null,
        tempPosition: [],
        onAddItem: () => false,
        onDeleteItem: () => false,
        onFinishEditItem: () => false,
        changeControls: () => false
    };

    constructor(p: any) {
        super(p);
        this.state = {
            __pending: false,
            canDelete: false,
            errors: [],
            ...p.selectedItem
        }
    }

    componentDidMount(): void {
        this.props.setDialogSaveButton(
            (
                <PrimaryButton
                    style={{width: 70, marginRight: 10}}
                    title={'Save'}
                    onPres={this.handleOk}
                />
            )
        )
    }

    componentWillReceiveProps(nextProps: any, nextContext: any): void {
        checkError(nextProps, this.props, () => 1, this.refs.toast);
        if (nextProps.itemsList !== this.props.itemsList) {
            this.setState({__pending: false});
            this.handleCancel({});
        }
    }

    protected handleOk = async (e: any) => {
        try {
            this.setState({__pending: true});
            await this.props.editItem({
                ...this.state,
            });
            this.props.onFinishEditItem();

        } catch (e) {
            // toast.show(e.response ? e.response.data.error || e.response.data.message : e.meesage || e, {
            //     position: toast.POSITION.TOP_LEFT
            // });
        } finally {
        }
    };

    protected handleCancel = (e: any) => {
        this.props.showDialogContent(null);
    };

    private getFields = () => {
        const fields = [];
        const {state} = this;
        const {isAdmin} = this.props;
        if (this.type === TYPES.PARCEL) {
            fields.push(
                {
                    title: 'Status',
                    name: 'status',
                    options: parcel_statuses
                },
                ...Parcel.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );
        } else if (this.type === TYPES.POLE) {
            fields.push(
                ...Pole.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );
        } else if (this.type === TYPES.SEGMENT) {
            fields.push(
                {
                    title: 'Status',
                    name: 'status',
                    options: segment_statuses
                },
                {
                    options: [0, 25, 50, 75, 100].map((el: number) => ({
                        value: el,
                        text: el
                    })),
                    name: 'vegetation_status',
                    title: 'Vegetation status',
                    disabled:!isAdmin
                },
                {
                    type: 6,
                    step: 1,
                    min: 0,
                    max: 10,
                    name: 'distance_lateral',
                    title: 'Distance lateral'
                },
                {
                    type: 6,
                    step: 1,
                    min: 0,
                    max: 15,
                    name: 'distance_bottom',
                    title: 'Distance bottom'
                },
                ...Segment.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );

            if (state.status === segment_statuses[3].value) {
                fields.push(
                    {
                        type: 6,
                        step: 1,
                        min: 1,
                        max: 12,
                        name: 'shutdown_time',
                        title: 'Shutdown time'
                    },
                    {
                        name: 'track',
                        title: 'Track',
                        options: [1, 2].map((el: number) => ({
                            value: el,
                            text: el
                        }))
                    },
                );
            }
            if ([
                segment_statuses[1].value,
                segment_statuses[2].value,
                segment_statuses[3].value,
                segment_statuses[4].value,
                segment_statuses[6].value,
            ].indexOf(state.status) > -1
            ) {
                fields.push(
                    {
                        type: 3,
                        name: 'operation_type',
                        title: 'Operation type',
                        options: segment_operation_type
                    },
                    {
                        type: 6,
                        step: 1,
                        min: 1,
                        max: 12,
                        name: 'time_of_operation',
                        title: 'time of operation'
                    },
                );
            }

            if ([
                segment_statuses[4].value
            ].indexOf(state.status) > -1
            ) {
                fields.push(
                    {
                        name: 'time_for_next_entry',
                        title: 'time for next entry'
                    }
                );
            }
            if ([
                segment_statuses[6].value
            ].indexOf(state.status) > -1
            ) {
                fields.push(
                    {
                        name: 'parcel_number_for_permit',
                        title: 'parcel number for permit'
                    }
                );
            }
            fields.push(
                {
                    type: 5,
                    name: 'notes',
                    title: 'Notes'
                }
            );


        } else if (this.type === TYPES.STATION) {
            fields.push(
                ...Station.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );
        } else if (this.type === TYPES.POI) {
            fields.push(
                {
                    title: 'Project',
                    name: 'projectId',
                    options: this.props.projects.map((el: any) => ({
                        text: el.title,
                        value: el.id
                    })),
                    disabled:!isAdmin
                },
                {
                    title: 'Category',
                    name: 'categoryId',
                    required: true,
                    options: this.props.categories.map((el: any) => ({
                        text: el.title,
                        value: el.id
                    })),
                    disabled:!isAdmin
                },
            );
        }
        return fields;
    };

    protected _render() {
        const state: any = this.state;
        const {title, comment}: any = this.state;
        const {selectedItem}: any = this.props;
        const fields = this.getFields();

        const {isAdmin} = this.props;

        return (
            <ScrollView>
                <Form>
                    {fields.map((el: any) => {
                        if(el.type === TYPES.STATION) {
                            return (
                                <View key={el.name}>

                                </View>
                            )
                        }
                    })}
                </Form>
            </ScrollView>
        )
    }
}

const localStyles = StyleSheet.create({
    modalTitle: {}
});