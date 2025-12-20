export const transposeChord = (chord, semiTones) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Hàm phụ để xử lý tăng tone cho một nốt đơn lẻ
  const transposeSingleNote = (note) => {
    // Tìm nốt gốc và các ký hiệu thăng/giáng
    let noteName = note[0];
    if (note[1] === '#' || note[1] === 'b') {
      noteName += note[1];
    }

    // Chuẩn hóa nốt giáng về nốt thăng để tìm trong mảng notes
    const normalizationMap = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    const normalizedNote = normalizationMap[noteName] || noteName;

    const currentIndex = notes.indexOf(normalizedNote);
    if (currentIndex === -1) return note; // Không tìm thấy thì trả về gốc

    let newIndex = (currentIndex + semiTones) % 12;
    if (newIndex < 0) newIndex += 12;

    // Trả về nốt mới kèm theo các hậu tố (m, 7, maj7...) nếu có
    const suffix = note.slice(noteName.length);
    return notes[newIndex] + suffix;
  };

  // LOGIC CHÍNH: Kiểm tra nếu có dấu gạch chéo (Slash Chord)
  if (chord.includes('/')) {
    const parts = chord.split('/');
    // Transpose cả hai phần rồi ghép lại bằng dấu /
    return transposeSingleNote(parts[0]) + '/' + transposeSingleNote(parts[1]);
  }

  // Nếu không có dấu /, xử lý như bình thường
  return transposeSingleNote(chord);
};