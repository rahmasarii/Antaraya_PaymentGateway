import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/AdminNavbar.module.css";

export default function AdminNavbar({ onLogout }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [activeSection, setActiveSection] = useState("rekap");

  const isDashboard = router.pathname === "/admin";
  const isProducts = router.pathname === "/admin/products";

  /* Detect active section while scrolling */
  useEffect(() => {
    if (!isDashboard) return;

    const handleScroll = () => {
      const rekap = document.getElementById("rekap");
      const transaksi = document.getElementById("transaksi");

      const scrollPos = window.scrollY + 150;

      if (transaksi && scrollPos >= transaksi.offsetTop) {
        setActiveSection("transaksi");
      } else {
        setActiveSection("rekap");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (!element) return router.push(`/admin?section=${id}`);

    element.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>

        {/* LOGO */}
        <div
          className={styles.navbarLogo}
          onClick={() => router.push("/admin")}
        >
          <h1>ADMIN</h1>
        </div>

        {/* MOBILE ICON */}
        <div className={styles.mobileMenuIcon} onClick={() => setOpen(!open)}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>

        {/* MENU */}
        <div
          className={`${styles.navbarMenu} ${
            open ? styles.navbarMenuActive : ""
          }`}
        >

          {/* REKAP */}
          <button
            className={`${styles.navLink} ${
              isDashboard && activeSection === "rekap"
                ? styles.navLinkActive
                : ""
            }`}
            onClick={() => scrollTo("rekap")}
          >
            Rekap Penjualan
          </button>

          {/* TRANSAKSI */}
          <button
            className={`${styles.navLink} ${
              isDashboard && activeSection === "transaksi"
                ? styles.navLinkActive
                : ""
            }`}
            onClick={() => scrollTo("transaksi")}
          >
            Daftar Transaksi
          </button>

          {/* PRODUK */}
          <button
            className={`${styles.navLink} ${
              isProducts ? styles.navLinkActive : ""
            }`}
            onClick={() => router.push("/admin/products")}
          >
            Daftar Produk
          </button>

          {/* LOGOUT */}
          <button className={styles.navLink} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
