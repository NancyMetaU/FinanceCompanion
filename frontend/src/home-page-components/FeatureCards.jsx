import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCards = () => {
  const features = [
    { title: "Budget Tools", path: "/budget", desc: "Track spending, take control." },
    { title: "Learning Modules", path: "/learning", desc: "Financial skills made easy." },
    { title: "News Digest", path: "/news", desc: "Stay informed, not overwhelmed." },
  ];

  return (
    <div className="feature-cards">
      {features.map((feat) => (
        <Link to={feat.path} className="feature-card" key={feat.title}>
          <h3>{feat.title}</h3>
          <p>{feat.desc}</p>
        </Link>
      ))}
    </div>
  );
};

export default FeatureCards;
