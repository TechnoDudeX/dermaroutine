// Checkout page — $5 one-time payment via Stripe
// Calls netlify/functions/create-checkout to get a Stripe Checkout session URL
// On success (stripe redirect back): Stripe webhook updates DB, redirect to /onboarding

export default function Checkout() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Checkout</h1>
      <a href="/">← Back to home</a>
    </div>
  )
}
