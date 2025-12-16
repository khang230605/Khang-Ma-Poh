// Danh sách 12 nốt nhạc cơ bản
const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const transposeChord = (chord, semitones) => {
  // 1. Tách hợp âm (Ví dụ: "F#m7" -> nốt "F#", hậu tố "m7")
  const match = chord.match(/^([A-G][#b]?)(.*)/);
  if (!match) return chord;

  const root = match[1]; // Nốt nhạc (tiền tố)
  const suffix = match[2]; // Kiểu hợp âm (hậu tố)

  // 2. Tìm vị trí nốt cũ trong mảng 12 nốt
  let index = chromaticScale.indexOf(root);
  if (index === -1) return chord;

  // 3. Tính toán vị trí nốt mới (xoay vòng trong mảng 12)
  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return chromaticScale[newIndex] + suffix;
};