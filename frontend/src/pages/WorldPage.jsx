// WorldPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorldPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/world', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 402) {
          navigate('/subscribe');
        } else if (res.status === 401) {
          navigate('/login');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) setContent(data.message);
        setLoading(false);
      });
  }, [navigate]);

  return loading ? <p>Loading...</p> : <h1>{content}</h1>;
}
