import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, message, Modal } from 'antd';

import ChatBox from '../ChatBox';
import LeftSidebar from '../LeftSidebar';
import ViewSharedModalContent from '../ViewSharedModal';
import TabAbout from '../Tabs/about';
import TabDisclaimers from '../Tabs/disclaimers';
import TabHelp from '../Tabs/help';
import TabPlugins from '../Tabs/plugins';
import TabSettings from '../Tabs/settings';
import TabWallet from '../Tabs/wallet';
import { SessionContext } from '../../contexts/SessionContext';
import { UserContext } from '../../contexts/UserContext';
import { DisplayContext } from "../../contexts/DisplayContext";
import { fetchUserProfile, getSettings } from '../../services/user';
import { fetchModelList } from '../../services/models';
import { fetchPluginList } from '../../services/plugins';
import { request } from "../../services/request";

import './index.scss'

const { Content, Sider } = Layout;

const MainLayout = ({handleLogout, changeLanguage}) => {

    const {displayMode} = useContext(DisplayContext);
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sharedSession, setSharedSession] = useState(null);
    const [messages, setMessages] = useState([]); 
    const [userProfile, setUserProfile] = useState(null); 
    const [settings, setSettings] = useState(null);
    const [modelInfo, setModelInfoDict] = useState(null);
    const [qcmdsList, setQcmdsList] = useState(null);
    const [pluginList, setPluginList] = useState(null);
    const [selectedPlugins, setSelectedPlugins] = useState([]);
    const [isModalViewSharedOpen, setModalViewSharedOpen] = useState(false);

    // const [prevSelectedSession, setPrevSelectedSession] = useState(null);
    const [curRightComponent, setCurRightComponent] = useState(0);  //切换右侧部件

    const { t } = useTranslation('MainLayout');

    useEffect(() => {
        fetchUserInfo();
        fetchSettings();
        fetchAvailableModels();
        fetchPluginAndQcmds();
    }, []);

    //检测share_id
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const shareId = urlParams.get('share_id');
        let url = new URL(window.location);
        url.searchParams.delete('share_id');
        window.history.replaceState(null, null, url.toString());

        if (shareId) {
            fetchSharedSession(shareId);
        }
    });
    //获取分享会话内容
    const fetchSharedSession = async ( shareId ) => {
        try {
            const response = await request.get('/api/shared?share_id=' + shareId);
            const shared = {...response.data, shareId};
            console.log(shared);
            setSharedSession(shared);
            setModalViewSharedOpen(true);
        } catch (error) {
            console.error('Failed to fetch shared session:', error);
            message.error(error.response.data.error, 2);
        }
    }

    // 获取登录用户信息
    const fetchUserInfo = async () => {
        try {
            const userData = await fetchUserProfile();
            setUserProfile(userData);
        } catch (error) {
            if (error.response.status === 404){
                message.error(t('MainLayout_FetchUserError'),2);
            }
        }
    };

    //获取用户设置项
    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            message.error(t('MainLayout_FetchSettingsError'), 2);
        }
    };

    //获取可用模型列表
    const fetchAvailableModels = async () => {
        try {
            const data = await fetchModelList();
            setModelInfoDict(data);
        } catch (error) {
            console.error('Failed to fetch models:', error);
            message.error("获取模型列表失败", 2);
        }
    }

    //获取插件列表、快捷指令列表
    const fetchPluginAndQcmds = async () => {
        try {
            const data = await fetchPluginList();
            setQcmdsList(data.qcmd);
            setPluginList(data.fc);
        } catch (error) {
            console.error('Failed to fetch plugins:', error);
            message.error(t('MainLayout_FetchPluginsError'), 2);
        }
    }

    //选中会话（在LeftSider中）
    const handleSelectSession = (session) => {
        setCurRightComponent(1);    //切换为聊天框
        setSelectedSession(session);
    };    

    //修改会话信息
    const handleChangeSessionInfo = (targetId, newData) => {
        setSessions((prevSessions) => {
            const updatedSessions = prevSessions.map(session =>
                session.id === targetId ? { ...session, ...newData} : session
            );
            return updatedSessions;
        });
        if (targetId === selectedSession.id) {
            setSelectedSession((prevSession) => ({
                ...prevSession,
                ...newData,
                }));
        }
    };

    //选择或取消选择插件
    const handleSelectPlugin = (pluginId) => {
        if (selectedPlugins.includes(pluginId)) {
            setSelectedPlugins(selectedPlugins.filter(id => id !== pluginId));
        } else {
            setSelectedPlugins([...selectedPlugins, pluginId]);
        }
    };
    
    //右侧可显示的组件列表
    const componentList = [
        <div/>,
        <div/>, //<ChatBox onChangeSessionInfo={handleChangeSessionInfo} curRightComponent={curRightComponent}/>,
        <TabAbout onCloseTab={() => handleChangeComponent(1)}/>,
        <TabDisclaimers onCloseTab={() => handleChangeComponent(1)}/>,
        <TabHelp onCloseTab={() => handleChangeComponent(1)}/>,
        <TabPlugins onCloseTab={() => handleChangeComponent(1)}/>,
        <TabSettings onCloseTab={() => handleChangeComponent(1)} changeLanguage={changeLanguage}/>,
        <TabWallet onCloseTab={() => handleChangeComponent(1)}/>,
    ];

    const handleChangeComponent = (index) => {
        // if (index !== 1){
        //     if (!prevSelectedSession) {setPrevSelectedSession(selectedSession);}
        //     setSelectedSession(null);
        //     setCurRightComponent(index);
        // }
        // else if (index === 1 && !selectedSession){
        //     setSelectedSession(prevSelectedSession);
        //     setPrevSelectedSession(null);
        //     setCurRightComponent(index);
        // }
        // if (index === 1 && !prevSelectedSession){
        //     setCurRightComponent(0);
        // }
        setCurRightComponent(index);
    };

    return (
        <SessionContext.Provider 
            value={{
                sessions,
                setSessions,
                selectedSession,
                setSelectedSession,
                sharedSession,
                messages,
                setMessages,
            }}>
            <UserContext.Provider
                value={{
                    userProfile,
                    fetchUserInfo,
                    settings,
                    setSettings,
                    fetchSettings,
                    modelInfo,
                    qcmdsList,
                    pluginList,
                    selectedPlugins,
                    handleSelectPlugin,
                }}>
                <Layout className="background fade-in">
                    <div className={`center-box-container-${displayMode}`}>
                        <Layout className="center-box" style={{ width: '100%', height: '100%', display: 'flex'}}>
                            <Sider className='Sider' width={300}>
                                <LeftSidebar 
                                    onSelectSession={handleSelectSession}
                                    onLogoutClick={handleLogout}
                                    onChangeComponent={handleChangeComponent}
                                    onChangeSessionInfo={handleChangeSessionInfo}
                                    />
                            </Sider>
                            <Layout>
                                <Layout>
                                    <Content style={{ minHeight: '0', flex: '1' }}>
                                    {selectedSession  && 
                                        <div style={{ height: '100%',display: curRightComponent === 1 ? '' : 'none'}}>
                                            <ChatBox 
                                                onChangeSessionInfo={handleChangeSessionInfo} 
                                                onChangeComponent={handleChangeComponent}
                                                curRightComponent={curRightComponent}/>
                                        </div>}
                                    {curRightComponent !== 1 && componentList[curRightComponent]}
                                    </Content>
                                </Layout>   
                            </Layout>
                        </Layout>
                    </div>
                    <div
                        style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        textAlign: 'center',
                        }}>
                        <p style={{fontSize: '12px', color: '#aaaaaa', letterSpacing: '0.3px'}}>{t('MainLayout_Footer_Copyright')}<br/>{t('MainLayout_Footer_TechSupport')} <a className='footer-link' href="mailto:gpt@sjtu.edu.cn" title="gpt@sjtu.edu.cn">{t('MainLayout_Footer_ContactLinkText')}</a></p>
                    </div>
                </Layout>
                <Modal title={`${t('MainLayout_ViewSharedModal_Title_Head')} ${sharedSession?.username} ${t('MainLayout_ViewSharedModal_Title_End')} - ${sharedSession?.name}`} open={isModalViewSharedOpen} footer={null} 
                    onCancel={() => setModalViewSharedOpen(false)} width={800}
                    >
                    <ViewSharedModalContent closeModal={() => setModalViewSharedOpen(false)}/>
                </Modal>
            </UserContext.Provider>
        </SessionContext.Provider>
    );
  };

export default MainLayout;