import {SelectStyles as Styles} from '@mobile-reality/react-native-select-pro';

type SelectStylesType = (colors: any) => Styles;

export const selectStyles: SelectStylesType = colors => ({
  optionsList: {
    marginTop: -110,
    backgroundColor: colors.info,
    padding: 5,
  },
  option: {
    container: {
      marginVertical: 2,
      marginRight: 10,
    },
    text: {
      color: colors.accent,
    },
    selected: {
      container: {
        backgroundColor: `${colors.accent}33`,
        borderRadius: 50,
      },
      text: {
        color: colors.accent,
      },
    },
  },
  select: {
    container: {
      backgroundColor: colors.info,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    text: {
      color: colors.accent,
    },
    arrow: {
      icon: {
        backgroundColor: colors.secondary,
        borderRadius: 50,
        tintColor: colors.accent,
      },
    },
  },
});
