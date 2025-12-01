import { memo } from 'react';

export const RatingStars = memo(({ rating, onRatingChange, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange && onRatingChange(star)}
          className={`no-theme ${sizeClasses[size]} transition-colors ${
            star <= rating
              ? 'text-yellow-400 hover:text-yellow-500'
              : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <i className="ri-star-fill"></i>
        </button>
      ))}
      {rating > 0 && (
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      )}
    </div>
  );
});

RatingStars.displayName = 'RatingStars';

export default RatingStars;

