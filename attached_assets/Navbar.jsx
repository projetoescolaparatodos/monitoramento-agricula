import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{
      position: "absolute",
      top: "20px",
      right: "20px",
      zIndex: 1000,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "10px",
      borderRadius: "5px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    }}>
      <Link to="/admin" style={{ textDecoration: "none", color: "black" }}>Admin</Link>
    </nav>
  );
};

export default Navbar;