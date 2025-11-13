// components/CartButton.jsx
const CartButton = () => (
  <button
    className="btn"
    style={{
    //   background: 'linear-gradient(180deg,#FF652D 0%,#F45C43 100%)',
      borderRadius: '8px',
      padding: '12px',
      marginRight: '8px',
    }}
  >
    <i className="bi bi-cart text-secondary" style={{ fontSize: 24, color: 'white' }}></i>
  </button>
);

export default CartButton;
