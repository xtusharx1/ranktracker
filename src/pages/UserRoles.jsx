import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Header, Segment, Button } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';

const UserRoles = () => {
    const [roles, setRoles] = useState([]);
    const [userCounts, setUserCounts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('https://apistudents.sainikschoolcadet.com/api/role/')
            .then(response => {
                setRoles(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the roles!', error);
            });

        axios.get('https://apistudents.sainikschoolcadet.com/api/users/roles/count')
            .then(response => {
                const counts = response.data.reduce((acc, item) => {
                    acc[item.role_id] = item.count;
                    return acc;
                }, {});
                setUserCounts(counts);
            })
            .catch(error => {
                console.error('There was an error fetching the user counts!', error);
            });
    }, []);


    const handleViewClick = (roleId) => {
        if (roleId === 2) {
            navigate('/Students');
        } else {
            navigate(`/user-list/${roleId}`);
        }
    };

    return (
        <Container style={{ marginTop: '30px' }}>
            <Segment padded>
                <Header as="h2" textAlign="center" style={{ marginBottom: '20px' }}>
                    User Roles
                </Header>
                <Table celled striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Role</Table.HeaderCell>
                            <Table.HeaderCell>User Count</Table.HeaderCell>
                            <Table.HeaderCell>Action</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {roles.map(role => (
                            <Table.Row key={role.role_id}>
                                <Table.Cell>{role.role_name}</Table.Cell>
                                <Table.Cell>{userCounts[role.role_id] || 0}</Table.Cell>
                                <Table.Cell><Button primary onClick={() => handleViewClick(role.role_id)}>View</Button></Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>
        </Container>
    );
};

export default UserRoles;
