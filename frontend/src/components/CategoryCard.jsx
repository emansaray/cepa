import { Link } from "react-router-dom";

export default function CategoryCard({ category, index }) {
  return (
    <Link to={`/c/${category.slug}`} className="category-card card">
      <span className="category-tab" aria-hidden="true" />
      <div className="category-card-body">
        <div className="record-no">Chamber No. {String(index + 1).padStart(2, "0")}</div>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
      </div>
      <div className="category-card-count">
        <span className="count-number">{category._count?.threads ?? 0}</span>
        <span className="count-label">threads</span>
      </div>
    </Link>
  );
}
