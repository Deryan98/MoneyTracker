import {StackNav} from '@navigation/StackNav';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';
// import {fixedExpenses} from '@data/fixedExpenses';
import {faLayerGroup} from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import {faBookBookmark} from '@fortawesome/free-solid-svg-icons/faBookBookmark';
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import {faPiggyBank} from '@fortawesome/free-solid-svg-icons/faPiggyBank';
import {faChartPie} from '@fortawesome/free-solid-svg-icons/faChartPie';
// import {varOutcomes} from '@data/varOutcomes';
// import {incomes} from '@data/incomes';
import {accent, colors} from '@constants/colors/colors';
import {TouchableOpacity, View} from 'react-native';
import Resumen from '@screens/ResumenScreen';
import AccountsScreen from '@screens/AccountsScreen';
import BudgetsScreen from '@screens/BudgetsScreen';
import AnalysisScreen from '@screens/AnalysisScreen';

export const bottomTabsRoutes: IBottomTab[] = [
  {
    name: 'Resumen',
    component: Resumen,
    initialParams: {category: 'incomes'},
    options: {
      title: 'Resumen',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faHome} color={color} size={size} />
      ),
    },
  },
  {
    name: 'Accounts',
    component: AccountsScreen,
    initialParams: {category: 'fixedExpenses'},
    options: {
      title: 'Accounts',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faLayerGroup} color={color} size={size} />
      ),
    },
  },
  {
    name: 'Outcomes',
    component: StackNav,
    initialParams: {category: 'fixedExpenses'},
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
    component: BudgetsScreen,
    options: {
      title: 'Budgets',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faPiggyBank} color={color} size={size} />
      ),
    },
  },
  {
    name: 'AnalysisScreen',
    component: AnalysisScreen,
    initialParams: {category: 'varOutcomes'},
    options: {
      title: 'Analysis',
      tabBarIcon: ({color, size}) => (
        <FontAwesomeIcon icon={faChartPie} color={color} size={size} />
      ),
    },
  },
];
