import React, {useRef, useState, useEffect} from 'react';
import {Layout, Menu, Typography, Divider, Col, Row, Button, Card} from 'antd';
import {PlusCircleOutlined, RocketOutlined, UserOutlined, EllipsisOutlined, QuestionCircleOutlined, DeleteOutlined} from '@ant-design/icons';
import axios from 'axios';

import './index.css'

const { Content, Footer, Header } = Layout;
const { Title, Paragraph } = Typography;

function LeftSidebar ({ selectedSession, onSelectSession }) {
    
    const [sessions, setSessions] = useState([]);

    //通过设备标识验证（开发中使用）
    const getDeviceId = () => {
        const { userAgent } = navigator;
        const hashCode = (s) => {
            let h = 0;
            for (let i = 0; i < s.length; i++) {
                h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
            }
            return h;
        };
        const deviceId = hashCode(userAgent).toString();
        return deviceId;
        };
    // 使用设备标识
    const deviceId = getDeviceId();

    useEffect(() => {
        fetchSessions();
    }, []);

    //获取会话列表
    const fetchSessions = async () => {
        try {
            const response = await axios.get('/api/sessions',{
                headers: {
                    'device-id': deviceId,  // 将设备ID添加到请求头中
                },
            });
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    };

    //删除会话
    const handleDeleteSession = async (event, sessionId) => {
        event.stopPropagation(); 
        try {
            await axios.delete(`/api/sessions/${sessionId}`);
            // 更新会话列表
            setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId));

            // 确定下一个或上一个会话
            let nextSelectedSession = null;
            const sessionIndex = sessions.findIndex(session => session.id === sessionId);
            if (sessionIndex !== -1) {
                if (sessionIndex < sessions.length - 1) {
                // 如果删除的不是最后一个会话，则选择下一个会话
                nextSelectedSession = sessions[sessionIndex + 1];
                } else if (sessionIndex > 0) {
                // 如果删除的是最后一个会话且列表中还有其他会话，则选择上一个会话
                nextSelectedSession = sessions[sessionIndex - 1];
                }
            }

            onSelectSession(nextSelectedSession); // 更新选定的会话
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    //新建会话
    const handleCreateSession = async () => {
        try {
            const response = await axios.post('/api/sessions', {
                device_id: deviceId,
            });
            const newSession = response.data;
            setSessions([...sessions, newSession]);
            onSelectSession(newSession); // 进入新创建的会话
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleSelectSession = (session) => {
        onSelectSession(session);
    };

    // useEffect(() => {
    //     if (sessions.length === 0) {
    //         handleCreateSession(); // 如果会话列表为空，自动创建新会话
    //     }
    // }, [sessions]);

    return (
        <Layout style={{ height: '100%'}}>
            <Header className='Sider-content'>
                <Typography style={{margin:'0px 25px'}}>
                    <Title level={2} style={{ fontWeight: 'bold', marginBottom: 5}}>Chat SJTU</Title>
                    <Paragraph style={{ fontSize:'16px', marginBottom: 10}}>交大人的AI助手</Paragraph>
                </Typography>
                <Row style={{margin:'0px 17.5px'}}>
                    <Col span={12} className='button-col'>
                        <Button block size="large" type="text" icon={<RocketOutlined />}>
                            伴我学
                        </Button>
                    </Col>
                    <Col span={12} className='button-col'>
                        <Button block size="large" type="text" icon={<PlusCircleOutlined/>}
                            onClick={handleCreateSession}>
                            新的会话
                        </Button>
                    </Col>
                </Row>
            </Header>
            <Content className='Sider-content' style={{ overflow: 'auto' }}>
                <Menu style={{margin:'0px 17px 0px 25px'}}>
                    {sessions.map((session) => (
                        <Menu.Item className={`ant-menu-item${selectedSession?.id === session.id ? '-selected' : '-unselected'}`}
                            key={session.id} style={{margin:'15px 0px'}}>
                        <div
                            style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            cursor: 'pointer',
                            }}
                            onClick={() => handleSelectSession(session)}
                        >
                            <span>{session.name}</span>

                            {selectedSession && selectedSession.id === session.id && (
                                <Button
                                    className='delete-button'
                                    style={{backgroundColor:'transparent', marginRight: '-10px'}}
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeleteSession(event, session.id);
                                    }}
                                />
                                )}
                        </div>
                        </Menu.Item>
                    ))}
                    </Menu>
            </Content>
            <Footer className='Sider-content'>
                <Divider className="gradient-divider"></Divider>
                <Row style={{margin:'0px 17.5px 20px 17.5px'}}>
                    <Col span={5} className='button-col'>
                        <Button block size="large" type="text" icon={<UserOutlined />}/>
                    </Col>
                    <Col span={5} className='button-col'>
                        <Button block size="large" type="text" icon={<QuestionCircleOutlined />}/>
                    </Col>
                    <Col span={9} className='button-col'/>
                    <Col span={5} className='button-col'>
                        <Button block size="large" type="text" icon={<EllipsisOutlined />}/>
                    </Col>
                </Row>
            </Footer>
        </Layout>
    )
}

export default LeftSidebar;