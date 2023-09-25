import {RootNavigator} from '@navigation/RootNavigator';
import {selectedLanguage} from '@constants/languages';
import {FormCategory} from '@components/pages/FormCategory';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faLayerGroup} from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';
import {faBookBookmark} from '@fortawesome/free-solid-svg-icons/faBookBookmark';

export const drawerRouter: IDrawer[] = [
  {
    name: selectedLanguage.drawer[0].label,
    component: RootNavigator,
    options: {
      drawerLabel: selectedLanguage.drawer[0].label,
      drawerIcon: ({color, focused, size}: any) => (
        <FontAwesomeIcon icon={faHome} color={color} size={size} />
      ),
    },
  },
  {
    name: selectedLanguage.drawer[1].label,
    component: FormCategory,
    options: {
      drawerLabel: selectedLanguage.drawer[1].label,
      drawerIcon: ({color, focused, size}) => (
        <FontAwesomeIcon icon={faBookBookmark} color={color} size={size} />
      ),
    },
  },
  {
    name: selectedLanguage.drawer[2].label,
    component: FormCategory,
    options: {
      drawerLabel: selectedLanguage.drawer[2].label,
      drawerIcon: ({color, focused, size}) => (
        <FontAwesomeIcon icon={faLayerGroup} color={color} size={size} />
      ),
    },
  },
];
