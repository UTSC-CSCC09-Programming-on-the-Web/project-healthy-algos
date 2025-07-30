import { useEffect, useState } from 'react';
import '../styles/MembershipPage.css';

export default function MembershipPage({ user }) {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchInfo = async () => {
            const res = await fetch(`${API_BASE}/api/stripe/membership-info`, {
                credentials: 'include',
            });
            const data = await res.json();
            setInfo(data);
            setLoading(false);
        };
        fetchInfo();
    }, []);

    useEffect(() => {
        if (info?.status === 'canceled') {
            navigate('/subscribe');
        }
    }, [info]); useEffect(() => {
        if (info?.status === 'canceled') {
            navigate('/subscribe');
        }
    }, [info]);

    const handleCancel = async () => {
        await fetch(`${API_BASE}/api/stripe/cancel-membership`, {
            method: 'POST',
            credentials: 'include',
        });
        alert('Membership cancellation scheduled.');
        window.location.reload();
    };

    if (loading) return <p>Loading...</p>;
    if (!info) return <p>No membership info found.</p>;

    const expirationDate = info.current_period_end
        ? new Date(info.current_period_end).toLocaleDateString()
        : 'Unknown';

    return (
        <div className="membership-page">
            <div className="membership-container">
                <img
                    src="/media/iSim_txt.png"
                    alt="iSim Logo"
                    className="membership-logo"
                />
                <h2 className="membership-heading">Membership Details</h2>
                <p className="membership-status">Status: {info.status}</p>
                <p className="membership-expiration">
                    Expires on: {expirationDate}
                </p>

                {info.cancel_at_period_end ? (
                    <p className="membership-description">
                        Your membership will cancel at the end of the period.
                    </p>
                ) : (
                    <button onClick={handleCancel} className="cancel-button">
                        Cancel Membership
                    </button>
                )}
            </div>
        </div>

    );
}
