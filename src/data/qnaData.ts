export interface Answer {
  id: number;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
}

export interface QnaItem {
  id: number;
  title: string;
  description: string;
  author: string;
  source: string;
  image: string;
  createdAt: string;
  likes: number;
  answers: Answer[];
}

export const qnaData: QnaItem[] = [
  {
    id: 1,
    title: 'Xin kinh nghiệm Xuyên Việt 30 ngày',
    description: `Mình dự kiến giữa tháng 04 này làm chuyến xuyên Việt (gửi xe từ TP.HCM ra Hà Nội rồi đi cung Đông Bắc - Tây Bắc). 
Vòng về lại chạy xe dọc miền Trung vào lại HCM. 
Anh/chị nào từng đi cho mình xin ít kinh nghiệm chuẩn bị, đặc biệt là chỗ ngủ, ăn uống, và giấy tờ xe cộ.`,
    author: 'Nguyễn Văn A',
    source: 'Google',
    image: '/city-2.svg',
    createdAt: '2025-09-10',
    likes: 56,
    answers: [
      {
        id: 1,
        author: 'Trần Minh',
        avatar: '/city-2.svg',
        content: `Bạn nhớ chuẩn bị giấy tờ xe đầy đủ nhé, cung Đông Bắc có nhiều đoạn đèo dốc cần tay lái vững.`,
        createdAt: '2025-09-12',
      },
      {
        id: 2,
        author: 'Lê Hồng',
        avatar: '/city-2.svg',
        content: `Nên đi vào tháng 9–10 sẽ đẹp hơn, tháng 4 hay có mưa bất chợt.`,
        createdAt: '2025-09-13',
      },
    ],
  },
  {
    id: 2,
    title: 'Review cung Hà Giang 5 ngày 4 đêm',
    description: `Có ai từng đi cung Hà Giang cho mình xin lịch trình chi tiết. Mình tính đi nhóm 6 người bằng xe máy.`,
    author: 'Trần Bình',
    source: 'Google',
    image: '/city-2.svg',
    createdAt: '2025-09-11',
    likes: 23,
    answers: [],
  },
  {
    id: 3,
    title: 'Hỏi về homestay Đà Lạt giá rẻ',
    description: `Mọi người có thể giới thiệu giúp mình homestay nào ở Đà Lạt giá tầm 300k/đêm, view đẹp, gần trung tâm không?`,
    author: 'Phạm Thảo',
    source: 'Google',
    image: '/city-2.svg',
    createdAt: '2025-09-12',
    likes: 12,
    answers: [],
  },
    {
    id: 4,
    title: 'Hỏi về homestay Đà Lạt giá rẻ',
    description: `Mọi người có thể giới thiệu giúp mình homestay nào ở Đà Lạt giá tầm 300k/đêm, view đẹp, gần trung tâm không?`,
    author: 'Phạm Thảo',
    source: 'Google',
    image: '/city-2.svg',
    createdAt: '2025-09-12',
    likes: 12,
    answers: [],
  },
    {
    id: 5,
    title: 'Hỏi về homestay Đà Lạt giá rẻ',
    description: `Mọi người có thể giới thiệu giúp mình homestay nào ở Đà Lạt giá tầm 300k/đêm, view đẹp, gần trung tâm không?`,
    author: 'Phạm Thảo',
    source: 'Google',
    image: '/city-2.svg',
    createdAt: '2025-09-12',
    likes: 12,
    answers: [],
  },
];
