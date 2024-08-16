import {HomeNavigator} from '@navigation/[home]/HomeNavigator';
import {selectedLanguage} from '@constants/languages';
import {CategoriesScreen, CreateCategory} from '@screens/[categories]';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faLayerGroup} from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';
import {faBookBookmark} from '@fortawesome/free-solid-svg-icons/faBookBookmark';
import {CategoriesTopTabs} from '@navigation/[categories]/CategoriesTopTabs';

export const drawerRouter: IDrawer[] = [
  {
    name: selectedLanguage.drawer[0].label,
    component: HomeNavigator,
    options: {
      drawerLabel: selectedLanguage.drawer[0].label,
      drawerIcon: ({color, focused, size}: any) => (
        <FontAwesomeIcon icon={faHome} color={color} size={size} />
      ),
    },
  },
  {
    name: selectedLanguage.drawer[1].label,
    component: CategoriesTopTabs,
    options: {
      drawerLabel: selectedLanguage.drawer[1].label,
      drawerIcon: ({color, focused, size}) => (
        <FontAwesomeIcon icon={faBookBookmark} color={color} size={size} />
      ),
    },
  },
  {
    name: selectedLanguage.drawer[2].label,
    component: CreateCategory,
    options: {
      drawerLabel: selectedLanguage.drawer[2].label,
      drawerIcon: ({color, focused, size}) => (
        <FontAwesomeIcon icon={faLayerGroup} color={color} size={size} />
      ),
    },
  },
];
