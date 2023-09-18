import {StackNav} from '@navigation/StackNav';
import FirstRun from '@screens/FirstRun';
import CustomTabBarButton from './CustomTabBarButton';
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

export const bottomTabsRoutes: IBottomTab[] = [
  {
    name: 'Incomes',
    component: StackNav,
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
          size={50}
        />
      ),
      tabBarButton: ({onPress, children}) => {
        return (
          <CustomTabBarButton onPress={onPress}>{children}</CustomTabBarButton>
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
