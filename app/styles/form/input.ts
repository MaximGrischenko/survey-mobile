import {StyleSheet} from 'react-native';
import {COLORS} from '../colors';

const _styles: any = {
    input: {
        borderBottomColor: COLORS.PRIMARY,
        borderBottomWidth: 1,
        backgroundColor: COLORS.WHITE,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
        width: '100%'
    }
};

const styles = StyleSheet.create(_styles);
export default styles;