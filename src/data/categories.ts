export interface Agent {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  agents: Agent[];
}

// 获取图标 URL 的辅助函数
const getIcon = (name: string) => new URL(`../assets/images/${name}`, import.meta.url).href;

export const categories: Category[] = [
  {
    id: 'applications',
    name: 'Applications',
    agents: [
      {
        id: 'housing',
        title: 'Housing Support Agent',
        description: 'Get help with your housing application and status.',
        icon: getIcon('mkqz1zwx-7is7qmf.svg'),
        url: 'https://mk2.lovekd.top:20000/chat/d1fb967a4c5a732c'
      }
    ]
  },
  {
    id: 'notifications',
    name: 'Notifications',
    agents: [
      {
        id: 'support',
        title: 'Support Officer',
        description: 'Connect with a support officer for general inquiries.',
        icon: getIcon('mkqz1zwx-k1cuph1.svg'),
        url: 'https://mk2.lovekd.top:20000/chat/d1fb967a4c5a732c'
      }
    ]
  },
  {
    id: 'recommendations',
    name: 'Recommendations',
    agents: [
      {
        id: 'energy',
        title: 'Energy Grant Advisor',
        description: 'Check your eligibility for energy grants.',
        icon: getIcon('mkqz1zwx-bqimk93.svg'),
        url: 'https://mk2.lovekd.top:20000/chat/d1fb967a4c5a732c'
      }
    ]
  },
  {
    id: 'documents',
    name: 'Documents',
    agents: [
      {
        id: 'docs',
        title: 'Document Assistant',
        description: 'Upload and review your required documents.',
        icon: getIcon('mkqz1zwx-3ud8f6t.svg'),
        url: 'https://mk2.lovekd.top:20000/chat/d1fb967a4c5a732c'
      }
    ]
  }
];
