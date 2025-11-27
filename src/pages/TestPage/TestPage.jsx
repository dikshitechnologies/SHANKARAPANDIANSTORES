import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { API_ENDPOINTS } from '../../config/apiEndpoints.jsx';

export default function TestPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get(API_ENDPOINTS.itemGroup.dropdownlist);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Item Groups</h1>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Parent Name</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.fitemcode}>
                            <td>{item.fitemcode}</td>
                            <td>{item.fitemname}</td>
                            <td>{item.parentName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}