export default function Loading() {
  return (
    <div
      className="shop-loading"
      role="status"
      aria-label="Loading / Chargement / جارٍ التحميل"
    >
      <div className="loading-copy">
        <span />
        <span />
        <span />
      </div>
      <div className="loading-photo" />
      <div className="loading-cards">
        {[1, 2, 3].map((value) => (
          <div key={value} />
        ))}
      </div>
    </div>
  );
}
