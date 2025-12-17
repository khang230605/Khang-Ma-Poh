/**
 * Chuyển đổi các dạng link YouTube về dạng Embed để nhúng vào iframe
 * @param {string} url - Đường dẫn youtube người dùng nhập
 * @returns {string|null} - Đường dẫn đã chuyển đổi hoặc null nếu không phải link youtube
 */
export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  // Regex hỗ trợ nhiều dạng: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, v.v.
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  return null;
};