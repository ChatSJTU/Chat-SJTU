import React, {useRef,useState} from 'react';
import {Layout} from 'antd';
import ChatBox from '../ChatBox';
import LeftSidebar from '../LeftSidebar';

import './index.css'

const { Content, Sider} = Layout;

const MainLayout = ({handleLogout}) => {

    const [selectedSession, setSelectedSession] = useState(null);

    const handleSelectSession = (session) => {
        setSelectedSession(session);
    };    

    return (
        <div className="background"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: '#fafafa',
                position: 'relative',
            }}>
                <div
                    style={{
                        width: '80%',
                        height: '90%',
                        background: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #ccc',
                        boxShadow: '30px 30px 60px 10px rgba(0, 0, 0, 0.08)',
                    }}>
                    <Layout className="center-box" style={{ width: '100%', height: '100%', display: 'flex'}}>
                        <Sider className='Sider' width={300}>
                            <LeftSidebar 
                                selectedSession={selectedSession} 
                                onSelectSession={handleSelectSession}
                                onLogoutClick={handleLogout}
                                />
                        </Sider>
                        <Layout>
                            <Content>
                                {selectedSession && <ChatBox selectedSession={selectedSession} />}
                            </Content>
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
                <p style={{fontSize: '12px', color: '#aaaaaa'}}>© 2023 上海交通大学 沪交ICP备20230139</p>
            </div>
        </div>
    );
  };

export default MainLayout;