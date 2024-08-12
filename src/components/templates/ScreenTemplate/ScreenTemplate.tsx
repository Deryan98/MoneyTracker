import {FC, PropsWithChildren} from 'react';
import { ViewStyle } from 'react-native';
import {ScreenContainer} from '@components/atoms/containers/ScreenContainer';
import {ScrollContainer} from '@components/atoms/containers/ScrollContainer';

import {MainHeader} from '@components/molecules/Headers/MainHeader';
import { ScreenContainerTypes } from '@components/atoms/containers/ScreenContainer/types';

interface ScreenTemplateProps extends PropsWithChildren {
  headerTitle?: string;
  screenContainerStyle?: ViewStyle;
}

const ScreenTemplate: FC<ScreenTemplateProps> = ({headerTitle, screenContainerStyle = {}, children}) => {
  return (
    <ScrollContainer style={{flex: 1}}>
      <ScreenContainer containerStyle={screenContainerStyle}>
        <MainHeader title={headerTitle} />
        {children}
      </ScreenContainer>
    </ScrollContainer>
  );
};

export default ScreenTemplate;
