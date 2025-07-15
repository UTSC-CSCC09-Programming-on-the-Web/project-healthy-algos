import '../styles/SubscriptionPage.css';

export default function SubscriptionPage() {
  const handleSubscribe = async () => {
    const res = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    sessionStorage.setItem("fromSubscription", "true");
    window.location.href = data.url;
  };

  return (
    <div className="subscription-page">
      <img
          src="/media/iSim_txt.png"
          alt="iSim Logo"
          className="subscription-logo"
        />
      <h1>Subscribe to Access iSim Features</h1>
      <p>$10/month subscription required.</p>
      <button className="subscription-button" onClick={handleSubscribe}>
        <img
          src="/media/stripe_logo.png"
          alt="Stripe Logo"
          className="stripe-logo"
        />
        Subscribe Now
      </button>
    </div>
  );
}
