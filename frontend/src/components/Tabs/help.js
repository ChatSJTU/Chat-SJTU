import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Layout, Typography, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import './style.scss'

const { Header, Content } = Layout;
const { Title } = Typography;

function TabHelp ({ onCloseTab }) {

    const [loaded, setLoaded] = useState(true);

    useEffect(() => {
        setLoaded(true);
    }, []);

    let { t } = useTranslation('Tabs_help');

    return(
        <Layout style={{ height: '100%'}}>
            <Header className='Header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{t('Tabs_help_Title')}</h2>
                <Button icon={<CloseOutlined />} onClick={onCloseTab}/>
            </Header>
            <Content className={loaded ? 'tab-content float-up' : 'tab-content'} style={{ overflow: 'auto'}}>
                <Typography>
                    <Title level={2} style={{fontFamily: "Trebuchet MS, Arial, sans-serif", marginTop:'25px'}}>
                        {t('Tabs_help_Subtitle_Head')} <span style={{ color: '#a72139' }}>{t('Tabs_help_Subtitle_Body')}</span> {t('Tabs_help_Subtitle_End')}
                        </Title>
                </Typography>
            </Content>
        </Layout>
    )
};
  
export default TabHelp;