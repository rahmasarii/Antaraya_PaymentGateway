import styles from "../styles/footer.module.css";

export default function Footer() {
  const copyToClipboard = (number) => {
    navigator.clipboard.writeText(number);
    alert(`Nomor ${number} telah disalin`);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Hubungi Kami</h3>

            {/* NOMOR DENGAN COPY ON CLICK */}
            <p
              className={styles.copyNumber}
              onClick={() => copyToClipboard("+62 812-9613-5571")}
            >
              Gading Serpong, +62 812-9613-5571
            </p>

            <p
              className={styles.copyNumber}
              onClick={() => copyToClipboard("+62 813-1898-3498")}
            >
              Jakarta Barat, +62 813-1898-3498
            </p>

            <br />
            <p>Senin–Jumat: 8.00 – 17.30</p>
            <p>Sabtu: 8.00 – 13.00</p>
          </div>

          <div className={styles.footerSection}>
            <h3>Ikuti Kami</h3>
            <div className={styles.socialLinks}>
              <a href="https://www.instagram.com/pt.antarayapersada/" className={styles.socialLink}>Instagram</a>
              <a href="https://shopee.co.id/antarayapersada" className={styles.socialLink}>Shopee</a>
              <a href="https://www.tokopedia.com/antaraya-1" className={styles.socialLink}>Tokopedia</a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h3>ANTARAYA</h3>
            <p>Premium audio equipment untuk pengalaman mendengar terbaik Anda.</p>
          </div>
        </div>

        {/* BRAND LOGOS */}
        <div className={styles.footerBrands}>
          <div className={styles.brandLogoItem}>
            <img
              src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/b06286ba-ff07-4798-b70d-548e404c6c24/Long+normal+26x7.5.png?format=750w"
              alt="Antaraya"
            />
          </div>
          <div className={styles.brandLogoItem}>
            <img
              src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/4fa552a3-b070-4147-b2ef-39317c0384d1/Jive+Transparent+black.png?format=500w"
              alt="Jive Audio"
            />
          </div>
          <div className={styles.brandLogoItem}>
            <img
              src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/b8cb54c1-ba98-40f4-b13c-c338b416739e/Alluve+long+inv+bg.png?format=750w"
              alt="Alluve"
            />
          </div>
          <div className={styles.brandLogoItem}>
            <img
              src="https://images.squarespace-cdn.com/content/v1/68e5e6c1d684b33ea2171767/19be8492-2927-49bd-9923-d8b605f00c0d/SINGLE+BEAN+Transparent.png?format=500w"
              alt="Single Bean"
            />
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className={styles.footerBottom}>
          <p>© 2024 Antaraya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
