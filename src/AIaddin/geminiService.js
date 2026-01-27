// src/AIaddin/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const fetchRealLyrics = async (title, artist) => {
  try {
    const params = new URLSearchParams({
      track_name: title,
      artist_name: artist || "" 
    });

    const response = await fetch(`https://lrclib.net/api/search?${params}`);
    if (!response.ok) return { found: false };

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const bestMatch = data[0];
      const lyricsText = bestMatch.plainLyrics || bestMatch.syncedLyrics;
      if (lyricsText) {
        return {
          found: true,
          lyrics: lyricsText,
          title: bestMatch.trackName,
          artist: bestMatch.artistName,
          image: bestMatch.albumArt 
        };
      }
    }
    return { found: false };
  } catch (error) {
    console.warn("Lỗi API LrcLib, chuyển sang chế độ AI tự nghĩ...");
    return { found: false };
  }
};

export const findLyricsWithGemini = async ({ title, artist, songwriter, link }) => {
  try {
    const realData = await fetchRealLyrics(title, artist);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    let prompt = "";

    if (realData.found) {
      // --- SỬA PROMPT CHẾ ĐỘ 1: ĐÃ CÓ LỜI THÔ ---
      prompt = `
        NHIỆM VỤ: Định dạng lại lời bài hát sau đây.
        
        INPUT:
        ${realData.lyrics}

        YÊU CẦU BẮT BUỘC (STRICT MODE):
        1. Xóa toàn bộ timecode (ví dụ [00:12.34]).
        2. Thêm các nhãn cấu trúc: (Verse), (Chorus), (Bridge)... đặt trong ngoặc tròn.
        3. Giữ nguyên nội dung lời hát, không sửa chính tả hay thêm bớt từ.
        4. QUAN TRỌNG NHẤT: CHỈ TRẢ VỀ NỘI DUNG LỜI BÀI HÁT. 
           - KHÔNG được có câu mở đầu (ví dụ: "Dưới đây là...", "Here is the lyrics...").
           - KHÔNG được có câu kết thúc.
           - Bắt đầu output ngay lập tức bằng ký tự đầu tiên của lời bài hát hoặc nhãn cấu trúc.
      `;
    } else {
      // --- SỬA PROMPT CHẾ ĐỘ 2: AI TỰ NHỚ ---
      prompt = `
        NHIỆM VỤ: Tìm lời bài hát chính xác.
        
        Thông tin:
        - Bài hát: "${title}"
        - Ca sĩ: "${artist || "Không rõ"}"
        
        YÊU CẦU BẮT BUỘC (STRICT MODE):
        1. Nếu biết lời: Trả về lời bài hát với định dạng [Verse], [Chorus].
        2. Nếu không tìm thấy: Trả về duy nhất chữ "NOT_FOUND".
        3. QUAN TRỌNG NHẤT: CHỈ TRẢ VỀ NỘI DUNG LỜI BÀI HÁT.
           - KHÔNG thêm bất kỳ lời dẫn chuyện, lời chào, hay giải thích nào.
           - Bắt đầu output ngay lập tức.
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // --- BƯỚC LÀM SẠCH CUỐI CÙNG (Dọn rác nếu AI vẫn lì lợm) ---
    // Đôi khi AI vẫn lỡ miệng nói "Here is...", ta dùng code cắt bỏ luôn cho chắc.
    text = text.replace(/^(Here is|Here are|Dưới đây là|This is|Sure,).*?:/gim, "").trim();
    // -----------------------------------------------------------

    if (realData.found) {
      return { 
        type: 'REAL_SEARCH', 
        content: text, 
        meta: { title: realData.title, artist: realData.artist, image: realData.image } 
      };
    }

    return { type: 'AI_GENERATED', content: text, meta: null };

  } catch (error) {
    console.error("Lỗi xử lý:", error);
    return "Xin lỗi, hiện tại không thể lấy lời bài hát (Lỗi kết nối AI).";
  }
};