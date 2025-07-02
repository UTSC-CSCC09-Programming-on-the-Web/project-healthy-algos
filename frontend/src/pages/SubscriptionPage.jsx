export default function SubscriptionPage() {
  const handleSubscribe = async () => {
    const res = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    window.location.href = data.url; // redirect to Stripe Checkout
  };

  return (
    <div>
      <h1>Subscribe to Access iSim Features</h1>
      <p>$10/month subscription required.</p>
      <button onClick={handleSubscribe}>Subscribe Now</button>
    </div>
  );
}
