import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import LanguageSwitcher from './LanguageSwitcher';
import { StarIcon, SunIcon } from '../assets/icons';

type Option = {
  label: string;
  // how this option contributes to MBTI dimensions
  score?: Partial<{ EI: number; SN: number; TF: number; JP: number }>;
  value?: string;
};

type Question = {
  id: string;
  title: string;
  options: Option[];
  // whether this step is for zodiac selection (stored separately)
  type?: 'zodiac' | 'gender' | 'mbti';
  // allow multiple selections
  multiple?: boolean;
};


function computeZodiac(month: number, day: number): string {
  // Western zodiac by month/day ranges
  const ranges = [
    { name: 'Capricorn', from: [12, 22], to: [1, 19] },
    { name: 'Aquarius', from: [1, 20], to: [2, 18] },
    { name: 'Pisces', from: [2, 19], to: [3, 20] },
    { name: 'Aries', from: [3, 21], to: [4, 19] },
    { name: 'Taurus', from: [4, 20], to: [5, 20] },
    { name: 'Gemini', from: [5, 21], to: [6, 20] },
    { name: 'Cancer', from: [6, 21], to: [7, 22] },
    { name: 'Leo', from: [7, 23], to: [8, 22] },
    { name: 'Virgo', from: [8, 23], to: [9, 22] },
    { name: 'Libra', from: [9, 23], to: [10, 22] },
    { name: 'Scorpio', from: [10, 23], to: [11, 21] },
    { name: 'Sagittarius', from: [11, 22], to: [12, 21] },
  ];
  const inRange = (m: number, d: number, from: [number, number], to: [number, number]) => {
    const [fm, fd] = from; const [tm, td] = to;
    if (fm <= tm) {
      // same year range
      return (m > fm || (m === fm && d >= fd)) && (m < tm || (m === tm && d <= td));
    }
    // across year end (e.g., Capricorn)
    return (m > fm || (m === fm && d >= fd)) || (m < tm || (m === tm && d <= td));
  };
  const found = ranges.find(r => inRange(month, day, r.from, r.to));
  return found ? found.name : 'Capricorn';
}

const baseQuestions: Question[] = [
  {
    id: 'gender',
    title: "Giới tính của bạn là gì?",
    type: 'gender',
    options: [
      { label: 'Nam', value: 'male' },
      { label: 'Nữ', value: 'female' },
      { label: 'Giới tính khác', value: 'other' },
    ],
  },
  {
    id: 'interested',
    title: 'Bạn quan tâm tới ai?',
    options: [
      { label: 'Nam', value: 'male' },
      { label: 'Nữ', value: 'female' },
      { label: 'Giới tính khác', value: 'other' },
      { label: 'Tất cả', value: 'any' },
    ],
  },
  {
    id: 'birthdate',
    title: 'Ngày sinh của bạn là?',
    options: [
      { label: 'Chọn ngày sinh' },
    ],
  },
  // EI: năng lượng xã hội
  {
    id: 'ei-1',
    title: 'Cuối tuần bạn thích làm gì?',
    type: 'mbti',
    options: [
      { label: 'Tham gia sự kiện, gặp gỡ nhiều người', score: { EI: 1 } },
      { label: 'Ở nhà nạp năng lượng, làm việc riêng', score: { EI: -1 } },
      { label: 'Đi chơi với vài người thân thiết', score: { EI: -0.5 } },
      { label: 'Thử hoạt động mới với nhóm nhỏ', score: { EI: 0.5 } },
    ],
  },
  {
    id: 'ei-3',
    title: 'Trong buổi họp nhóm, bạn thường…',
    type: 'mbti',
    options: [
      { label: 'Phát biểu sớm để dẫn dắt', score: { EI: 1 } },
      { label: 'Lắng nghe trước rồi chốt ý cuối', score: { EI: -1 } },
      { label: 'Góp ý khi có điểm mạnh', score: { EI: 0.5 } },
      { label: 'Ghi chép và tổng hợp', score: { EI: -0.5 } },
    ],
  },
  {
    id: 'ei-2',
    title: 'Bạn thấy thoải mái nhất khi giao tiếp như thế nào?',
    type: 'mbti',
    options: [
      { label: 'Nói ra suy nghĩ ngay lập tức', score: { EI: 1 } },
      { label: 'Suy nghĩ kỹ rồi mới nói', score: { EI: -1 } },
      { label: 'Viết trước khi nói', score: { EI: -0.5 } },
      { label: 'Trao đổi tự nhiên tùy tình huống', score: { EI: 0.5 } },
    ],
  },
  {
    id: 'sn-3',
    title: 'Khi đọc tin tức, bạn để ý…',
    type: 'mbti',
    options: [
      { label: 'Số liệu, chi tiết cụ thể', score: { SN: -1 } },
      { label: 'Xu hướng, bức tranh lớn', score: { SN: 1 } },
      { label: 'Nguồn dẫn và ngữ cảnh', score: { SN: -0.5 } },
      { label: 'Tác động dài hạn', score: { SN: 0.5 } },
    ],
  },
  // SN: nhận thức thông tin
  {
    id: 'sn-1',
    title: 'Khi học một chủ đề mới, bạn thường…',
    type: 'mbti',
    options: [
      { label: 'Tập trung vào dữ liệu, ví dụ cụ thể', score: { SN: -1 } },
      { label: 'Tưởng tượng khả năng và ý tưởng lớn', score: { SN: 1 } },
      { label: 'Bắt đầu từ nguyên lý tổng quát', score: { SN: 0.5 } },
      { label: 'Làm từng bước có quy trình', score: { SN: -0.5 } },
    ],
  },
  {
    id: 'sn-2',
    title: 'Khi mô tả một trải nghiệm, bạn…',
    type: 'mbti',
    options: [
      { label: 'Nêu chi tiết chính xác, số liệu, cảm quan', score: { SN: -1 } },
      { label: 'Nói về ý nghĩa, mẫu hình, ẩn ý', score: { SN: 1 } },
      { label: 'Kể câu chuyện theo diễn biến', score: { SN: -0.5 } },
      { label: 'Tổng kết bằng thông điệp chính', score: { SN: 0.5 } },
    ],
  },
  // TF: ra quyết định
  {
    id: 'tf-1',
    title: 'Khi đưa ra quyết định khó, bạn ưu tiên…',
    type: 'mbti',
    options: [
      { label: 'Lý lẽ, tiêu chí khách quan', score: { TF: -1 } },
      { label: 'Tác động đến con người, cảm xúc', score: { TF: 1 } },
      { label: 'Cân bằng cả hai khía cạnh', score: { TF: 0 } },
      { label: 'Tham khảo phản hồi của người liên quan', score: { TF: 0.5 } },
    ],
  },
  {
    id: 'tf-2',
    title: 'Trong tranh luận, bạn thường…',
    type: 'mbti',
    options: [
      { label: 'Tập trung vào tính đúng sai, lập luận', score: { TF: -1 } },
      { label: 'Giữ hoà khí và sự tôn trọng', score: { TF: 1 } },
      { label: 'Phân tích nhưng vẫn mềm mỏng', score: { TF: -0.5 } },
      { label: 'Đặt câu hỏi để hiểu nhau hơn', score: { TF: 0.5 } },
    ],
  },
  // JP: tổ chức cuộc sống
  {
    id: 'jp-1',
    title: 'Lịch trình của bạn thường…',
    type: 'mbti',
    options: [
      { label: 'Có kế hoạch rõ ràng, thích hoàn thành sớm', score: { JP: -1 } },
      { label: 'Linh hoạt, để mọi thứ mở cho cơ hội', score: { JP: 1 } },
      { label: 'Lập kế hoạch nhưng vẫn đổi nếu cần', score: { JP: -0.5 } },
      { label: 'Tùy hứng, xử lý theo cảm hứng', score: { JP: 0.5 } },
    ],
  },
  {
    id: 'jp-2',
    title: 'Khi làm bài/đồ án, bạn…',
    type: 'mbti',
    options: [
      { label: 'Chia nhỏ việc, bám deadline', score: { JP: -1 } },
      { label: 'Khám phá, để ý tưởng dẫn đường', score: { JP: 1 } },
      { label: 'Hoàn thành phần cốt lõi trước', score: { JP: -0.5 } },
      { label: 'Bắt đầu từ phần thú vị nhất', score: { JP: 0.5 } },
    ],
  },
  // Relationship preferences & personality taste
  {
    id: 'rel-goal',
    title: 'Bạn đang tìm gì ở đây?',
    options: [
      { label: 'Mối quan hệ nghiêm túc', value: 'serious' },
      { label: 'Hẹn hò nhẹ nhàng', value: 'casual' },
      { label: 'Kết nối bạn bè', value: 'friends' },
      { label: 'Chưa biết, cứ khám phá', value: 'explore' },
    ],
  },
  {
    id: 'preferred-traits',
    title: 'Bạn thích người như thế nào? (chọn ít nhất 3)',
    multiple: true,
    options: [
      { label: 'Ấm áp' },
      { label: 'Thẳng thắn' },
      { label: 'Hài hước' },
      { label: 'Tinh tế' },
      { label: 'Độc lập' },
      { label: 'Chăm chỉ' },
      { label: 'Sáng tạo' },
    ],
  },
  {
    id: 'preferred-activities',
    title: 'Bạn thích làm gì cùng nhau? (chọn ít nhất 3)',
    multiple: true,
    options: [
      { label: 'Cafe trò chuyện' },
      { label: 'Đi bộ' },
      { label: 'Đọc sách' },
      { label: 'Xem phim' },
      { label: 'Du lịch' },
      { label: 'Chơi thể thao' },
      { label: 'Nấu ăn cùng nhau' },
    ],
  },
];

function buildVisibleQuestions(selected: Record<string, string>): Question[] {
  const list: Question[] = [];
  for (const q of baseQuestions) {
    list.push(q);
    if (q.id === 'gender' && selected['gender'] === 'Giới tính khác') {
      list.push({
        id: 'orientation',
        title: 'Bạn thuộc nhóm nào trong LGBT?',
        options: [
          { label: 'Les', value: 'les' },
          { label: 'Gay', value: 'gay' },
          { label: 'Bisexual', value: 'bisexual' },
          { label: 'Transgender', value: 'transgender' },
        ],
      });
      list.push({
        id: 'role',
        title: 'Vai trò của bạn là gì?',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Bot', value: 'bottom' },
          { label: 'Versatile', value: 'versatile' },
        ],
      });
    }
    if (q.id === 'interested' && selected['interested']) {
      list.push({
        id: 'interested-role',
        title: 'Bạn quan tâm tới vai trò nào?',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Bot', value: 'bottom' },
          { label: 'Versatile', value: 'versatile' },
        ],
      });
    }
  }
  return list;
}

const compatMbtiMap: Record<string, string[]> = {
  ENFP: ['INFJ', 'INTJ'],
  INFP: ['ENFJ', 'ENTJ'],
  ENTP: ['INFJ', 'INTJ'],
  INTP: ['ENFJ', 'ENTJ'],
  ENTJ: ['INFP', 'ISFP'],
  INTJ: ['ENFP', 'ENTP'],
  ENFJ: ['INFP', 'ISFP'],
  INFJ: ['ENFP', 'ENTP'],
  ESFP: ['ISTJ', 'ISFJ'],
  ISFP: ['ENFJ', 'ESFJ'],
  ESTP: ['INFJ', 'INFP'],
  ISTP: ['ESFJ', 'ENFJ'],
  ESFJ: ['INTP', 'ISTP'],
  ISFJ: ['ESFP', 'ESTP'],
  ESTJ: ['ISFP', 'INFP'],
  ISTJ: ['ESFP', 'ENFP'],
};

const compatZodiacMap: Record<string, string[]> = {
  Aries: ['Leo', 'Sagittarius', 'Gemini'],
  Taurus: ['Virgo', 'Capricorn', 'Cancer'],
  Gemini: ['Libra', 'Aquarius', 'Aries'],
  Cancer: ['Scorpio', 'Pisces', 'Taurus'],
  Leo: ['Aries', 'Sagittarius', 'Libra'],
  Virgo: ['Taurus', 'Capricorn', 'Cancer'],
  Libra: ['Gemini', 'Aquarius', 'Leo'],
  Scorpio: ['Cancer', 'Pisces', 'Capricorn'],
  Sagittarius: ['Aries', 'Leo', 'Aquarius'],
  Capricorn: ['Taurus', 'Virgo', 'Scorpio'],
  Aquarius: ['Gemini', 'Libra', 'Sagittarius'],
  Pisces: ['Cancer', 'Scorpio', 'Capricorn'],
};

const zodiacSymbols: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const zodiacColors: Record<string, [string, string]> = {
  Aries: ['#F2D4AE', '#F7B2AD'],
  Taurus: ['#C8D5B9', '#BFD8B8'],
  Gemini: ['#BDE0FE', '#9AD8D6'],
  Cancer: ['#D7C6E6', '#A7C7E7'],
  Leo: ['#F2D4AE', '#FCE7A1'],
  Virgo: ['#C8D5B9', '#C9D4F0'],
  Libra: ['#F7C8D0', '#C9D4F0'],
  Scorpio: ['#CBB4D4', '#F7C8D0'],
  Sagittarius: ['#FCE7A1', '#BFD8B8'],
  Capricorn: ['#CDD5E0', '#A7C7E7'],
  Aquarius: ['#BDE0FE', '#9AD8D6'],
  Pisces: ['#D7C6E6', '#F7C8D0'],
};

const mbtiColors: Record<string, [string, string]> = {
  ENFP: ['#9AD8D6', '#D7C6E6'],
  INFP: ['#BFD8B8', '#A7C7E7'],
  ENTP: ['#F7B2AD', '#BDE0FE'],
  INTP: ['#C9D4F0', '#CDD5E0'],
  ENTJ: ['#F2D4AE', '#CBB4D4'],
  INTJ: ['#D7C6E6', '#9AD8D6'],
  ENFJ: ['#F7C8D0', '#BFD8B8'],
  INFJ: ['#A7C7E7', '#D7C6E6'],
  ESFP: ['#F7C8D0', '#FCE7A1'],
  ISFP: ['#BFD8B8', '#CBB4D4'],
  ESTP: ['#BDE0FE', '#F2D4AE'],
  ISTP: ['#CDD5E0', '#BFD8B8'],
  ESFJ: ['#C9D4F0', '#F7C8D0'],
  ISFJ: ['#D7C6E6', '#A7C7E7'],
  ESTJ: ['#FCE7A1', '#BFD8B8'],
  ISTJ: ['#A7C7E7', '#C9D4F0'],
};

const mbtiEmojis: Record<string, string> = {
  ENFP: '✨', INFP: '🎨', ENTP: '⚡', INTP: '🧠', ENTJ: '🚀', INTJ: '♟️', ENFJ: '🤝', INFJ: '🌱',
  ESFP: '🎉', ISFP: '🖌️', ESTP: '🏃', ISTP: '🛠️', ESFJ: '🎀', ISFJ: '🛡️', ESTJ: '📣', ISTJ: '📐',
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2), 16);
  const g = parseInt(h.slice(2,4), 16);
  const b = parseInt(h.slice(4,6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildPatternBackground(primary: string, secondary: string) {
  // Vintage pastel: lower alpha, subtle dots
  const gradient = `linear-gradient(135deg, ${hexToRgba(primary, 0.18)}, ${hexToRgba(secondary, 0.18)})`;
  const starsA = 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)';
  const starsB = 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)';
  return `${starsA}, ${starsB}, ${gradient}`;
}

// Starry brand background for the modal container (restore original vibe)
function buildModalBackground(primary: string, secondary: string, alpha = 0.24) {
  const gradient = `linear-gradient(135deg, ${hexToRgba(primary, alpha)}, ${hexToRgba(secondary, alpha)})`;
  const starsA = 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)';
  const starsB = 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)';
  return `${starsA}, ${starsB}, ${gradient}`;
}

const mbtiTagline: Record<string, string> = {
  ENFP: 'Nhà truyền cảm hứng – năng lượng và ý tưởng mới',
  INFP: 'Người lý tưởng hoá – giàu cảm xúc và giá trị',
  ENTP: 'Người tranh luận – sáng tạo và thích thử thách',
  INTP: 'Nhà logic – phân tích sâu và tò mò',
  ENTJ: 'Chỉ huy – quyết đoán và định hướng kết quả',
  INTJ: 'Kiến trúc sư – chiến lược và tầm nhìn',
  ENFJ: 'Người dẫn dắt – thấu cảm và kết nối',
  INFJ: 'Người biên đạo – trực giác và định hướng ý nghĩa',
  ESFP: 'Ngôi sao sân khấu – sống động và trải nghiệm',
  ISFP: 'Nghệ sĩ tự do – tinh tế và cảm hứng',
  ESTP: 'Nhà vận động – hành động và linh hoạt',
  ISTP: 'Thợ thủ công – thực tế và giải quyết vấn đề',
  ESFJ: 'Người chăm sóc – cộng đồng và hài hoà',
  ISFJ: 'Người bảo hộ – chu đáo và bền bỉ',
  ESTJ: 'Người điều hành – tổ chức và hiệu quả',
  ISTJ: 'Người hậu cần – tin cậy và hệ thống',
};

const zodiacInfo: Record<string, { description: string; strengths: string[]; growth: string[] }> = {
  Aries: { description: 'Nhiệt huyết, thẳng thắn, thích bắt đầu điều mới.', strengths: ['Quyết đoán', 'Dẫn dắt', 'Tinh thần tiên phong'], growth: ['Kiên nhẫn hơn', 'Lắng nghe sâu'] },
  Taurus: { description: 'Ổn định, thực tế, thích sự bền vững.', strengths: ['Kiên định', 'Đáng tin cậy', 'Cảm nhận tốt'], growth: ['Linh hoạt hơn', 'Chấp nhận thay đổi'] },
  Gemini: { description: 'Linh hoạt, giao tiếp tốt, tò mò.', strengths: ['Giao tiếp mạnh', 'Học nhanh', 'Đa nhiệm'], growth: ['Tập trung hơn', 'Theo đuổi đến cùng'] },
  Cancer: { description: 'Nhạy cảm, quan tâm, gắn kết gia đình.', strengths: ['Thấu cảm', 'Bảo vệ người thân', 'Trực giác tốt'], growth: ['Cân bằng cảm xúc', 'Rõ ràng ranh giới'] },
  Leo: { description: 'Tự tin, sáng tạo, thích toả sáng.', strengths: ['Lãnh đạo', 'Sáng tạo', 'Trung thành'], growth: ['Khiêm nhường', 'Lắng nghe góp ý'] },
  Virgo: { description: 'Tỉ mỉ, thực dụng, yêu sự chuẩn xác.', strengths: ['Chi tiết', 'Tận tâm', 'Phân tích tốt'], growth: ['Buông bỏ hoàn hảo', 'Nhìn bức tranh lớn'] },
  Libra: { description: 'Cân bằng, công bằng, yêu cái đẹp.', strengths: ['Hoà giải', 'Thẩm mỹ', 'Quan hệ tốt'], growth: ['Quyết đoán hơn', 'Tránh chiều lòng quá mức'] },
  Scorpio: { description: 'Sâu sắc, bí ẩn, mạnh mẽ.', strengths: ['Tập trung', 'Kiên cường', 'Trực giác mạnh'], growth: ['Cởi mở hơn', 'Tin tưởng người khác'] },
  Sagittarius: { description: 'Tự do, lạc quan, thích khám phá.', strengths: ['Tầm nhìn', 'Nhiệt huyết', 'Thích học hỏi'], growth: ['Ổn định hơn', 'Tôn trọng cam kết'] },
  Capricorn: { description: 'Kỷ luật, tham vọng, vững vàng.', strengths: ['Kiên trì', 'Trách nhiệm', 'Lãnh đạo thầm lặng'], growth: ['Mềm mỏng hơn', 'Cân bằng công việc-cuộc sống'] },
  Aquarius: { description: 'Độc đáo, hướng tương lai, nhân văn.', strengths: ['Sáng tạo', 'Tư duy hệ thống', 'Quan tâm xã hội'], growth: ['Thực tiễn hơn', 'Kết nối cảm xúc'] },
  Pisces: { description: 'Mơ mộng, nghệ thuật, thấu cảm.', strengths: ['Giàu tưởng tượng', 'Nhân ái', 'Trực giác cao'], growth: ['Ranh giới rõ ràng', 'Hành động quyết liệt'] },
};

function mbtiSummary(mbti: string) {
  const letters = mbti.split('');
  const description = mbtiTagline[mbti] || 'Phong cách độc đáo của bạn';
  const strengths = [
    letters[0] === 'E' ? 'Kết nối tự nhiên, lan toả năng lượng' : 'Tập trung sâu, suy nghĩ chín chắn',
    letters[1] === 'S' ? 'Chú ý chi tiết, đáng tin cậy' : 'Nhìn thấy tiềm năng và cơ hội',
    letters[2] === 'T' ? 'Logic rõ ràng, ra quyết định sáng suốt' : 'Thấu cảm, xử lý tình huống tinh tế',
    letters[3] === 'J' ? 'Tổ chức tốt, bám mục tiêu' : 'Linh hoạt, thích ứng nhanh',
  ];
  const growth = [
    letters[0] === 'E' ? 'Dành thời gian lắng nghe và suy ngẫm' : 'Chia sẻ suy nghĩ sớm hơn với người khác',
    letters[1] === 'S' ? 'Nhìn bức tranh lớn để không bỏ lỡ cơ hội' : 'Kiểm chứng ý tưởng bằng dữ liệu cụ thể',
    letters[2] === 'T' ? 'Kết nối cảm xúc để tạo đồng thuận' : 'Đặt tiêu chí rõ ràng để giữ khách quan',
    letters[3] === 'J' ? 'Chừa khoảng linh hoạt cho sáng tạo' : 'Xây dựng cấu trúc nhỏ để duy trì tiến độ',
  ];
  return { description, strengths, growth, compatibleMbti: compatMbtiMap[mbti] || [] };
}

const OnboardingPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { t, completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<{ EI: number; SN: number; TF: number; JP: number }>({ EI: 0, SN: 0, TF: 0, JP: 0 });
  const [showSummary, setShowSummary] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState<any>(null);

  const visibleQuestions = buildVisibleQuestions(selected);
  const current = visibleQuestions[step];
  const total = visibleQuestions.length;
  const percent = Math.round(((step + 1) / total) * 100);

  const selectOption = (opt: Option) => {
    // update selected value
    const prevOpt = !current.multiple ? current.options.find(o => selected[current.id] && (o.label === selected[current.id])) : undefined;
    // adjust scores: remove previous contribution, add new one
    setScores(prev => {
      let next = { ...prev };
      // subtract previous
      if (!current.multiple && prevOpt && prevOpt.score) {
        next = {
          EI: next.EI - (prevOpt.score.EI || 0),
          SN: next.SN - (prevOpt.score.SN || 0),
          TF: next.TF - (prevOpt.score.TF || 0),
          JP: next.JP - (prevOpt.score.JP || 0),
        };
      }
      // add new
      if (!current.multiple && opt.score) {
        next = {
          EI: next.EI + (opt.score.EI || 0),
          SN: next.SN + (opt.score.SN || 0),
          TF: next.TF + (opt.score.TF || 0),
          JP: next.JP + (opt.score.JP || 0),
        };
      }
      return next;
    });
    setSelected(s => {
      if (current.multiple) {
        const curr = Array.isArray(s[current.id]) ? s[current.id] as string[] : [];
        const exists = curr.includes(opt.label);
        const nextArr = exists ? curr.filter(l => l !== opt.label) : [...curr, opt.label];
        return { ...s, [current.id]: nextArr };
      }
      return ({ ...s, [current.id]: opt.label });
    });
  };

  const canNext = current.id === 'birthdate'
    ? Boolean(selected['birth_day'] && selected['birth_month'] && selected['birth_year'])
    : current.multiple
      ? Array.isArray(selected[current.id]) && (selected[current.id] as string[]).length >= 3
      : Boolean(selected[current.id]);

  const goNext = () => {
    if (step < total - 1) setStep(step + 1);
  };

  const goPrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const finish = () => {
    const mbti = `${scores.EI >= 0 ? 'E' : 'I'}${scores.SN >= 0 ? 'N' : 'S'}${scores.TF >= 0 ? 'F' : 'T'}${scores.JP >= 0 ? 'P' : 'J'}`;
    const genderSel = selected['gender'];
    const gender: 'male' | 'female' | 'other' | undefined =
      genderSel === 'Nam' ? 'male' : genderSel === 'Nữ' ? 'female' : genderSel ? 'other' : undefined;
    const zodiac = selected['zodiac'];
    const birthdate = selected['birthdate'];
    const interested = selected['interested'];
    const lookingFor = interested || undefined;
    const orientation = (selected['orientation'] as any) || undefined;
    const role = (selected['role'] as any) || undefined;
    const interestedRole = (selected['interested-role'] as any) || undefined;
    const relationshipGoal = (selected['rel-goal'] as string | undefined) || undefined;
    const preferredTraits = (selected['preferred-traits'] as string[] | undefined) || undefined;
    const preferredActivities = (selected['preferred-activities'] as string[] | undefined) || undefined;
    const status = buildStatusFromAnswers(selected);
    setFinalAnswers({ gender, mbti, zodiac, birthdate, lookingFor, orientation, role, interestedRole, relationshipGoal, preferredTraits, preferredActivities, status });
    setShowSummary(true);
  };

  const confirmSummary = () => {
    if (finalAnswers) {
      completeOnboarding(finalAnswers);
    }
    setShowSummary(false);
    onComplete();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4">
      <div className="absolute top-4 right-4 z-10"><LanguageSwitcher /></div>
      <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8 text-white" style={{ animation: 'floatY 8s ease-in-out infinite' }}>
        <div className="flex items-center justify-end mb-4 text-sm text-white/80">
          <span>{percent}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
          <div className="h-full brand-gradient-bg" style={{ width: `${percent}%` }} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">{current.title}</h1>

        {/* Options */}
        {current.id === 'birthdate' ? (
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="Ngày"
              className="px-4 py-3 bg-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
              value={selected['birth_day'] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setSelected(s => {
                  const next = { ...s, birth_day: val } as Record<string, string>;
                  const d = Number(next['birth_day']);
                  const m = Number(next['birth_month']);
                  const y = Number(next['birth_year']);
                  if (d && m && y) {
                    const dateStr = `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
                    const z = computeZodiac(m, d);
                    next['birthdate'] = dateStr;
                    next['zodiac'] = z;
                  }
                  return next;
                });
              }}
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="Tháng"
              className="px-4 py-3 bg-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
              value={selected['birth_month'] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setSelected(s => {
                  const next = { ...s, birth_month: val } as Record<string, string>;
                  const d = Number(next['birth_day']);
                  const m = Number(next['birth_month']);
                  const y = Number(next['birth_year']);
                  if (d && m && y) {
                    const dateStr = `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
                    const z = computeZodiac(m, d);
                    next['birthdate'] = dateStr;
                    next['zodiac'] = z;
                  }
                  return next;
                });
              }}
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Năm"
              className="px-4 py-3 bg-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
              value={selected['birth_year'] || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setSelected(s => {
                  const next = { ...s, birth_year: val } as Record<string, string>;
                  const d = Number(next['birth_day']);
                  const m = Number(next['birth_month']);
                  const y = Number(next['birth_year']);
                  if (d && m && y) {
                    const dateStr = `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
                    const z = computeZodiac(m, d);
                    next['birthdate'] = dateStr;
                    next['zodiac'] = z;
                  }
                  return next;
                });
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {current.options.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => selectOption(opt)}
                className={`text-left px-4 py-3 rounded-xl border ${(
                  current.multiple
                    ? (Array.isArray(selected[current.id]) && (selected[current.id] as string[]).includes(opt.label))
                    : selected[current.id]===opt.label
                ) ? 'brand-gradient-bg text-white border-transparent' : 'border-white/30 text-white/80'} transition`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center gap-4 mt-8">
          <button type="button" onClick={goPrev} className="flex-1 px-4 py-3 rounded-xl border border-white/30 text-white/80 hover:text-white hover:border-white/40 transition" disabled={step===0}>Quay lại</button>
          {step < total - 1 ? (
            <button type="button" onClick={goNext} disabled={!canNext} className="flex-1 btn-responsive brand-button disabled:opacity-40">Tiếp tục</button>
          ) : (
            <button type="button" onClick={finish} disabled={!canNext} className="flex-1 btn-responsive brand-button disabled:opacity-40">Hoàn tất</button>
          )}
        </div>
        {/* explanatory line removed per request */}
      </div>

      {showSummary && finalAnswers && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
          <div
            className="relative w-full max-w-2xl md:max-w-2xl backdrop-blur-xl rounded-3xl shadow-2xl p-4 md:p-5 text-white border border-white/10"
            style={{ backgroundImage: buildModalBackground('#6366f1', '#06b6d4', 0.26), backgroundSize: '20px 20px, 40px 40px, cover', backgroundPosition: '0 0, 10px 5px, center' }}
          >
            {/* Confetti layer for celebration */}
            <div className="confetti-layer">
              {Array.from({ length: 16 }).map((_, i) => {
                const colors = ['#fca5a5','#fdba74','#fde047','#86efac','#93c5fd','#c4b5fd','#f9a8d4'];
                const left = `${Math.round(Math.random() * 100)}%`;
                const delay = `${(Math.random() * 1.2 + 0.2).toFixed(2)}s`;
                const color = colors[i % colors.length];
                return (
                  <span key={i} className="confetti-piece" style={{ left, backgroundColor: color, animationDelay: delay }} />
                );
              })}
            </div>
            <div className="h-1 brand-gradient-bg rounded-full mb-4" />
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">🎉</span>
              <h2 className="text-xl md:text-2xl font-bold text-center">Tổng kết cá nhân hoá</h2>
            </div>
            <p className="text-center mt-1 text-white/70">MBTI và Cung hoàng đạo của bạn.</p>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {/* MBTI card */}
              <div
                className="rounded-2xl p-4 border border-white/10"
                style={{ backgroundImage: buildPatternBackground(...(mbtiColors[finalAnswers.mbti] || ['#3b82f6','#22d3ee'])), backgroundSize: '18px 18px, 32px 32px, cover', backgroundPosition: '0 0, 10px 5px, center' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-full text-xl leading-none text-white"
                    style={{ backgroundImage: `linear-gradient(135deg, ${(mbtiColors[finalAnswers.mbti] || ['#3b82f6','#22d3ee'])[0]}, ${(mbtiColors[finalAnswers.mbti] || ['#3b82f6','#22d3ee'])[1]})` }}
                  >
                    <span style={{ display: 'inline-block', animation: 'pulseSoft 2.4s ease-in-out infinite' }}>{mbtiEmojis[finalAnswers.mbti] || '✨'}</span>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-white/70">MBTI</div>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10">Cá tính</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl font-extrabold">{finalAnswers.mbti}</div>
                  <div className="text-white/75 text-sm line-clamp-2">{mbtiTagline[finalAnswers.mbti] || 'Phong cách riêng của bạn'}</div>
                </div>
                {(() => {
                  const info = mbtiSummary(finalAnswers.mbti);
                  return (
                    <div className="mt-4">
                      <div className="text-sm font-semibold mb-1">Ưu thế nổi bật</div>
                      <div className="flex flex-wrap gap-2">
                        {info.strengths.slice(0,3).map((s, i) => {
                          const pastel: [string,string][] = [
                            ['#BDE0FE','#D7C6E6'],
                            ['#F2D4AE','#CBB4D4'],
                            ['#BFD8B8','#A7C7E7'],
                            ['#F7C8D0','#C9D4F0'],
                            ['#FCE7A1','#BDE0FE'],
                            ['#CDD5E0','#F7C8D0'],
                          ];
                          const [a,b] = pastel[i % pastel.length];
                          return (
                            <span key={s} className="px-2 py-1 text-xs rounded-full text-black/80" style={{ backgroundImage: `linear-gradient(135deg, ${a}, ${b})` }}>{s}</span>
                          );
                        })}
                      </div>
                      <div className="mt-4 text-sm font-semibold mb-1">Lưu ý để phát triển</div>
                      <ul className="space-y-1 text-white/85 list-disc list-inside">
                        {info.growth.slice(0,3).map((s, i) => (<li key={i}>{s}</li>))}
                      </ul>
                      {info.compatibleMbti.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-semibold mb-1">Hợp với MBTI</div>
                          <div className="flex flex-wrap gap-2">
                            {info.compatibleMbti.slice(0,2).map((t) => {
                              const pair = mbtiColors[t] || ['#3b82f6','#22d3ee'];
                              return (
                                <span key={t} className="px-2 py-1 rounded-lg text-white" style={{ backgroundImage: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})` }}>{t}</span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Zodiac card */}
              <div
                className="rounded-2xl p-4 border border-white/10"
                style={{ backgroundImage: buildPatternBackground(...(zodiacColors[finalAnswers.zodiac] || ['#22d3ee','#6366f1'])), backgroundSize: '18px 18px, 32px 32px, cover', backgroundPosition: '0 0, 10px 5px, center' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-full text-xl leading-none text-white"
                    style={{ backgroundImage: `linear-gradient(135deg, ${(zodiacColors[finalAnswers.zodiac] || ['#22d3ee','#6366f1'])[0]}, ${(zodiacColors[finalAnswers.zodiac] || ['#22d3ee','#6366f1'])[1]})` }}
                  >{zodiacSymbols[finalAnswers.zodiac] || '☀️'}</div>
                  <div className="text-xs uppercase tracking-wide text-white/70">Cung hoàng đạo</div>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10">Năng lượng</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl font-extrabold">{finalAnswers.zodiac}</div>
                  <div className="text-white/75 text-sm line-clamp-2">{finalAnswers.zodiac && zodiacInfo[finalAnswers.zodiac]?.description}</div>
                </div>
                {finalAnswers.zodiac && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold mb-1">Ưu thế nổi bật</div>
                    <div className="flex flex-wrap gap-2">
                      {(zodiacInfo[finalAnswers.zodiac]?.strengths || []).slice(0,3).map((s, i) => {
                        const pastel: [string,string][] = [
                          ['#F2D4AE','#F7B2AD'],
                          ['#C8D5B9','#BFD8B8'],
                          ['#BDE0FE','#9AD8D6'],
                          ['#D7C6E6','#A7C7E7'],
                          ['#F7C8D0','#C9D4F0'],
                          ['#FCE7A1','#BFD8B8'],
                        ];
                        const [a,b] = pastel[i % pastel.length];
                        return (
                          <span key={i} className="px-2 py-1 rounded-lg text-black/80" style={{ backgroundImage: `linear-gradient(135deg, ${a}, ${b})` }}>{s}</span>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-sm font-semibold mb-1">Lưu ý để phát triển</div>
                    <ul className="space-y-1 text-white/85 list-disc list-inside">
                      {(zodiacInfo[finalAnswers.zodiac]?.growth || []).slice(0,3).map((s, i) => (<li key={i}>{s}</li>))}
                    </ul>
                    <div className="mt-4">
                      <div className="text-sm font-semibold mb-1">Hợp với các cung</div>
                      <div className="flex flex-wrap gap-2">
                        {(compatZodiacMap[finalAnswers.zodiac] || []).slice(0,2).map(z => {
                          const pair = zodiacColors[z] || ['#22d3ee','#6366f1'];
                          return (
                            <span key={z} className="px-2 py-1 rounded-lg text-white" style={{ backgroundImage: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})` }}>{z}</span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-center text-white/70 text-sm">
              <p>Chúng mình sẽ lưu MBTI và cung hoàng đạo vào hồ sơ của bạn.</p>
            </div>

            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => setShowSummary(false)} className="flex-1 px-4 py-3 rounded-xl border border-white/30 text-white/80 hover:text-white hover:border-white/40 transition">Xem lại câu trả lời</button>
              <button type="button" onClick={confirmSummary} className="flex-1 btn-responsive brand-button">Lưu và tiếp tục</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
  const buildStatusFromAnswers = (sel: Record<string, any>) => {
    const goalLabel = sel['rel-goal'] as string | undefined;
    const traits = (sel['preferred-traits'] as string[] | undefined) || [];
    const activities = (sel['preferred-activities'] as string[] | undefined) || [];
    const parts: string[] = [];
    if (goalLabel) parts.push(`Đang tìm ${goalLabel.toLowerCase()}`);
    if (traits.length > 0) parts.push(`thích người ${traits.slice(0,2).join(', ').toLowerCase()}`);
    if (activities.length > 0) parts.push(`hợp gu ${activities.slice(0,2).join(', ').toLowerCase()}`);
    return parts.join('; ');
  };