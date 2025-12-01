import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../styles/AdminNavbar.module.css";

export default function AdminNavbar({ onLogout }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isDashboard = router.pathname === "/admin";
  const isProducts = router.pathname === "/admin/products";

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
          {/* REKAP (dashboard utama) */}
          <button
            className={`${styles.navLink} ${
              isDashboard ? styles.navLinkActive : ""
            }`}
            onClick={() => {
              router.push("/admin");
              setOpen(false);
            }}
          >
            Rekap Penjualan
          </button>

          {/* PRODUK */}
          <button
            className={`${styles.navLink} ${
              isProducts ? styles.navLinkActive : ""
            }`}
            onClick={() => {
              router.push("/admin/products");
              setOpen(false);
            }}
          >
            Daftar Produk
          </button>

          {/* LOGOUT */}
          <button
            className={styles.navLink}
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
