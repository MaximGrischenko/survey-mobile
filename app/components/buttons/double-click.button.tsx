import React, {Component} from 'react';
import {TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';

interface IMapProps {
    onDoubleTap: Function,
    delay: number,
    style: object
}

export default class DoubleClickButton extends Component<IMapProps> {
    static defaultProps = {
        delay: 500,
        onDoubleTap: () => null,
        style: {}
    };

    private lastClick = null;

    private handleDoubleClick = () => {
        const now = Date.now();
        if (this.lastClick && (now - this.lastClick) < this.props.delay) {
            this.props.onDoubleTap();
        } else {
            this.lastClick = now;
        }
    };

    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return (
            <TouchableWithoutFeedback onPress={this.handleDoubleClick}>
                <View style={[this.props.style]}>
                    {this.props.children}
                </View>
            </TouchableWithoutFeedback>
        )
    }
}