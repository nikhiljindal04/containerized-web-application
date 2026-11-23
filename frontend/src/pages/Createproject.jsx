import { Button, Col, Flex, Row } from 'antd'
import React from 'react'
import { useCreateProject } from '../hooks/apis/mutations/useCreateProject';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Createproject() {

    const {createProjectMutation, isPending} = useCreateProject();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();

    const handleCreateProject = async () => {
        try {
            console.log("api calling");
            const response = await createProjectMutation();
            navigate(`/project/${response.data}`);
            console.log("redirect to the editor");
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
  return (
    <div style={{ minHeight: '100vh', background: '#0f111a', color: '#fff', padding: '24px' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <Link to="/" style={{ color: '#818cf8', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>
          &larr; Home
        </Link>
        {isAuthenticated && user ? (
          <Flex align="center" gap={12}>
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>
              Logged in as <strong style={{ color: '#e0e7ff' }}>{user.username}</strong> ({user.role})
            </span>
            <Button size="small" danger onClick={logout}>
              Sign Out
            </Button>
          </Flex>
        ) : (
          <Flex gap={8}>
            <Button size="small" type="primary" onClick={() => navigate('/signin')}>
              Sign In
            </Button>
            <Button size="small" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </Flex>
        )}
      </Flex>
      <Row justify="center" align="middle" style={{ marginTop: '80px' }}>
        <Col span={24}>
          <Flex vertical justify='center' align='center' gap={16}>
            <h2 style={{ color: '#f3f4f6', fontWeight: 600 }}>Create a new interactive coding workspace</h2>
            <Button type="primary" size="large" loading={isPending} onClick={handleCreateProject}>
              Create Playground
            </Button>
          </Flex>
        </Col>
      </Row>
    </div>
  )
}
