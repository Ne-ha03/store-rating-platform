// Small clickable 1-5 star control. Used wherever a normal user needs to
// submit or update a rating for a store.
export default function StarRating({ value, onChange, disabled }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-picker">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= value ? 'filled' : ''}`}
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          aria-label={`Rate ${star} out of 5`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
