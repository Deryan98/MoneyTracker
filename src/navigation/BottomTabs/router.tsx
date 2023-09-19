import {StackNav} from '@navigation/StackNav';
import FirstRun from '@screens/FirstRun';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';
import {fixedOutcomes} from '@data/fixedOutcomes';
import {faLayerGroup} from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import {faBookBookmark} from '@fortawesome/free-solid-svg-icons/faBookBookmark';
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import {faPiggyBank} from '@fortawesome/free-solid-svg-icons/faPiggyBank';
import {faChartPie} from '@fortawesome/free-solid-svg-icons/faChartPie';
import {varOutcomes} from '@data/varOutcomes';
import {incomes} from '@data/incomes';
import {accent, colors} from '@constants/colors/colors';
import {TouchableOpacity, View} from 'react-native';
import Resumen from '@screens/Resumen';

export const bottomTabsRoutes: IBottomTab[] = [
  {
    name: 'Incomes',
    component: Resumen,
    initialParams: {category: incomes},
    options: {
      title: 'Resumen',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faHome} color={color} size={size} />
      ),
    },
  },
  {
    name: 'OutcomeFix',
    component: StackNav,
    initialParams: {category: fixedOutcomes},
    options: {
      title: 'Accounts',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faLayerGroup} color={color} size={size} />
      ),
    },
  },
  {
    name: 'OutcomeFix2',
    component: StackNav,
    initialParams: {category: fixedOutcomes},
    options: {
      title: 'Categories',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faBookBookmark} color={color} size={size} />
      ),
    },
  },
  {
    name: 'OutcomeFix3',
    component: StackNav,
    initialParams: {category: fixedOutcomes},
    options: {
      title: '',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon
          icon={faPlusCircle}
          color={colors[accent][2]}
          size={70}
          style={{
            zIndex: 1,
            // bottom: 43,
            backgroundColor: colors[accent][0],
            borderRadius: 50,
          }}
        />
      ),
      tabBarItemStyle: {},
      tabBarIconStyle: {},
      tabBarButton: ({onPress, children}) => {
        return (
          // <CustomTabBarButton onPress={onPress}>{children}</CustomTabBarButton>
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 0,
              top: 0,
              left: '43%',
              width: 70,
              height: 0,
              backgroundColor: 'red',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={onPress}>
            {children}
          </TouchableOpacity>
        );
      },
    },
  },
  {
    name: 'Budgets',
    component: FirstRun,
    options: {
      title: 'Budgets',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faPiggyBank} color={color} size={size} />
      ),
    },
  },
  {
    name: 'OutcomeVar',
    component: StackNav,
    initialParams: {category: varOutcomes},
    options: {
      title: 'Analysis',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faChartPie} color={color} size={size} />
      ),
    },
  },
];
