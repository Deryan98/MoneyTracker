import {ScreenContainer} from '@components/atoms/containers/ScreenContainer';
import {FC, PropsWithChildren} from 'react';
import {ScrollContainer} from '@components/atoms/containers/ScrollContainer';

import {MainHeader} from '@components/molecules/Headers/MainHeader';

interface ScreenTemplateProps extends PropsWithChildren {
  headerTitle?: string;
}

const ScreenTemplate: FC<ScreenTemplateProps> = ({headerTitle, children}) => {
  return (
    <ScrollContainer style={{flex: 1}}>
      <ScreenContainer containerStyle={{alignItems: 'flex-start'}}>
        <MainHeader title={headerTitle} />
        {children}
      </ScreenContainer>
    </ScrollContainer>
  );
};

export default ScreenTemplate;
