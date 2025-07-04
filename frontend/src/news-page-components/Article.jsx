import React from "react";

const Article = ({ uuid, image_url, title, snippet, description, url }) => {
  return (
    <article key={uuid} className="flex flex-col items-center">
      <img
        src={image_url}
        alt={title}
        className="w-3/5 aspect-square object-cover rounded-md"
      />
      <div className="mt-4 w-3/5">
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {snippet || description}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-royal font-semibold hover:underline"
        >
          Read More →
        </a>
      </div>
    </article>
  );
};

export default Article;
