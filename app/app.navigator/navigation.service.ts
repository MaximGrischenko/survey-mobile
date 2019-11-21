import {NavigationActions} from "react-navigation";
import {DrawerActions} from "react-navigation-drawer";

let _navigator;

function setNavigator(navigatorRef) {
    _navigator = navigatorRef;
}

function navigate(routeName, params, options) {
    if(options.isDrawerOpen) {
        _navigator.dispatch(DrawerActions.toggleDrawer());
    }

    _navigator.dispatch(
        NavigationActions.navigate({
            routeName, params
        })
    )
}

export default {
    navigate,
    setNavigator
}