import React, {Component} from 'react';
import {Upload, Pole, Parcel, Segment, Station, Category, Project, Powerline} from "../../../../entities";
import {segment_statuses, parcel_statuses, segment_operation_type, checkError} from "../../../../redux/utils";

import {Form, Field} from 'react-native-validate-form';
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Slider,
    ScrollView,
    Dimensions
} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import Icon from "react-native-vector-icons/Ionicons";
import {InputField, required} from "../../../inputs/field.input";
import {TextField} from 'react-native-material-textfield';
import MultiSelect from "react-native-multiple-select";
import NumericInput from 'react-native-numeric-input';
import {PrimaryButton} from "../../../buttons/primary.button";
import DateTimePicker from "react-native-modal-datetime-picker";

import Carousel from 'react-native-snap-carousel';
import SliderEntry from "../../../uploads.preview";
import {entries} from './entries/index';
import UploadComponent from "../../../upload.component";


interface IMapProps {
    isAdmin: any,
    itemsList: any,
    position: any,
    selectedItem: any,
    location: any,
    categories: Array<Category>,
    projects: Array<Project>,
    powerlines: Array<Powerline>,
    tempPosition: Array<any>,
    onFinishEditItem: Function,
    changeControls: Function,
    editItem: Function,
    onDeleteItem: Function,
    onAddItem: Function,
    setDialogSaveButton: Function,
    showAlert: Function,
    showDialogContent: Function
}

interface IMapState {
    uploads: Array<Upload>,
    errors: any,
    status: any,
    date: any,
    id: any,
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
        powerlines: [],
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
        };
    }

    private Select: any = null;
    private Carousel: any = null;

    componentDidMount(): void {
        this.props.setDialogSaveButton(
            (
                <PrimaryButton
                    style={{width: 70, marginRight: 10}}
                    title={'Save'}
                    onPress={this.handleOk}
                />
            )
        )
    }

    componentWillUnmount(): void {
        this.props.setDialogSaveButton(null)
    }

    componentWillReceiveProps(nextProps: any, nextContext: any): void {
        if (nextProps.itemsList !== this.props.itemsList) {
            this.setState({__pending: false});
            this.handleCancel({});
        }
    }

    private onFieldChange = (key: string) => {
        return (val: any) => {
            const newState: any ={
                [key]: val
            };
            this.setState(newState);
        }
    };

    private onChange = (e: any) => {
        let value = e.target.value;
        if(e.target.getAttribute instanceof Function) {
            value = parseFloat(value);
            const min = parseInt(e.target.getAttribute('min'));
            const max = parseInt(e.target.getAttribute('max'));
            if(!isNaN(max) && value > max) {
                value = max;
            }
            if(!isNaN(min) && value < min) {
                value = min;
            }
        }

        const newState: any = {
            [e.target.name]: value
        };
        this.setState(newState);
    };

    protected handleOk = async (e: any) => {
        try {
            this.setState({__pending: true});
            const editItem: any = {
                ...this.state,
            };
            if (this.type === TYPES.SEGMENT) {
                if (editItem.operation_type) editItem.operation_type = editItem.operation_type ? editItem.operation_type.join(",") : '';
            }
            await this.props.editItem(editItem);
            if(this.props.onFinishEditItem instanceof Function) this.props.onFinishEditItem();
        } catch (e) {
            // toast.show(e.response ? e.response.data.error || e.response.data.message : e.meesage || e, {
            //     position: toast.POSITION.TOP_LEFT
            // });
        } finally {
        }
    };

    protected handleCancel = (e: any) => {
        this.props.showDialogContent(false);
    };

    private onUploadFile = (fileList) => {
        this.setState({
            uploads: [
                ...this.state.uploads,
                ...fileList
            ]
        })
    };

    private  onUpdateFile = (fileList) => {
        this.setState({
            uploads: [
                ...fileList
            ]
        })
    };

    private handleToggle = () => {
        console.log('select', this.Select);
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
                {
                    title: 'Powerline',
                    name: 'powerLineId',
                    options: this.props.powerlines.map((el: any) => ({
                        text: el.title,
                        value: el.id
                    })),
                    disabled:!isAdmin
                },
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
                    type: 2,
                    step: 1,
                    min: 0,
                    max: 10,
                    name: 'distance_lateral',
                    title: 'Distance lateral'
                },
                {
                    type: 2,
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
                        options: segment_operation_type.map((el: any) => ({
                            value: el.value,
                            text: el.text,
                            name: el.text,
                            id: el.id
                        }))
                    },
                    {
                        type: 4,
                        // step: 1,
                        // min: 1,
                        // max: 12,
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
        } else if (this.type === TYPES.STATION) {
            fields.push(
                ...Station.edit_keys.map((el: string) => ({
                    title: el,
                    name: el,
                    disabled:!isAdmin
                }))
            );
        } else if (this.type === TYPES.POI) {
            // if(!this.state.id) {
            //     fields.push(
            //         {
            //             title: 'Location',
            //             name: 'current',
            //             options: [{text:'current', value:'current'}, {text:'selected', value:'selected'}].map((el: any) => ({
            //                 value: el.text,
            //                 text: el.value
            //             })),
            //         },
            //     )
            // }
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
                    // removeLater: 1,
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

    private confirm = () => {

    };

    private cancel = () => {

    };

    protected _render() {
        const state: any = this.state;
        const {title, comment}: any = this.state;
        const {selectedItem}: any = this.props;
        const fields = this.getFields();
        const {isAdmin} = this.props;
        return (
            <ScrollView>
                <Form style={localStyles.form}>
                    {
                        fields.map((el: any) => {
                            if(el.type === 2) {
                                return (
                                    <View key={el.name} style={localStyles.distance}>
                                        <Text style={localStyles.label}>{el.name}:</Text>
                                        <NumericInput
                                            value={state[el.name]}
                                            minValue={el.min}
                                            maxValue={el.max}
                                            onChange={(value) => this.onChange({target: {name: el.name, value}})}
                                            totalWidth={150}
                                            totalHeight={40}
                                            type={'up-down'}
                                            iconSize={15}
                                            step={el.step}
                                            valueType='integer'
                                        />
                                    </View>
                                )
                            } else if(el.type === 3) {
                                return (
                                    <View key={el.name} style={{marginTop: 20}}>
                                        <MultiSelect
                                            hideSubmitButton={true}
                                            // onToggleList={this.handleToggle}
                                            uniqueKey={'name'}
                                            selectText={el.name}
                                            styleDropdownMenuSubsection={{height: 60, paddingLeft: 10}}
                                            styleInputGroup={{height: 60, justifyContent: 'flex-end', flexDirection: 'row'}}
                                            ref={(ref) => { this.Select = ref }}
                                            searchInputStyle={{display: 'none', width: 0}}
                                            styleRowList={{height: 40}}
                                            textColor={'#000'}
                                            itemTextColor={'#000'}
                                            searchInputPlaceholderText={'Search...'}
                                            selectedItems={state[el.name]}
                                            items={el.options}
                                            onSelectedItemsChange={(value) => this.onChange({target: {name: el.name, value}})}
                                        />
                                    </View>
                                )
                            } else if(el.type === 4) {
                                return (
                                    <View key={el.name}>
                                        <DateTimePicker onConfirm={this.confirm} onCancel={this.cancel} />
                                    </View>
                                )
                            } else if(el.options) {
                                return (
                                    <Field
                                        key={el.name}
                                        onChangeText={this.onFieldChange(el.name)}
                                        label={el.title}
                                        placeholder={el.name}
                                        value={state[el.name]}
                                        data={el.options.map((el: any) => ({
                                            label: el.text,
                                            value: el.value
                                        }))}
                                        disabled={el.disabled}
                                        component={Dropdown}
                                    />
                                )
                            } else {
                                return (
                                    <Field
                                        key={el.name}
                                        required
                                        label={el.name}
                                        placeholder={`Enter ${el.name}`}
                                        component={TextField}
                                        validations={[required]}
                                        name={el.name}
                                        value={state[el.name]}
                                        disabled={el.disabled}
                                        onChangeText={this.onFieldChange(el.name)}
                                        customStyle={{width: '100%'}}
                                    />
                                )
                            }
                        })
                    }
                    {
                        this.editTitle ? (
                            <View style={localStyles.comment}>
                                <Field
                                  //  key={title}
                                    //required
                                    label={"Title"}
                                    placeholder={`Enter title`}
                                    component={TextField}
                                  //  count={0}
                                  //  validations={[required]}
                                    name={'title'}
                                    value={title || ''}
                                  //  disabled={el.disabled}
                                    onChangeText={this.onFieldChange('title')}
                                    customStyle={{width: '100%'}}
                                />
                                <Field
                                    required
                                    component = {TextField}
                                    label={'Notes'}
                                    placeholder = "Enter notes"
                                    validations ={[required]}
                                    name ={ 'comment'}
                                    multiline = {true}
                                    numberOfLines = {5}
                                    value = {comment || ''}
                                    onChangeText = {this.onFieldChange('comment')}
                                    customStyle = {{width: '100%'}}
                                />
                            </View>
                        ) : null
                    }
                    {
                        <View>
                            <UploadComponent
                                files={selectedItem.uploads}
                                onUpload = {this.onUploadFile}
                                onUpdate = {this.onUpdateFile}
                            />
                        </View>
                    }
                </Form>
            </ScrollView>
        )
    }
}

const localStyles = StyleSheet.create({
    modalTitle: {},
    form: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    distance: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10
    },
    label: {
        marginRight: 20
    },
    comment: {
        marginTop: 20
    }
});