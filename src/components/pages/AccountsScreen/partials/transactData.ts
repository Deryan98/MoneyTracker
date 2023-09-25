import {faLayerGroup} from '@fortawesome/free-solid-svg-icons/faLayerGroup';
import {faHome} from '@fortawesome/free-solid-svg-icons/faHome';
import {faHamburger} from '@fortawesome/free-solid-svg-icons/faHamburger';

type TransactSection = {
  id: number;
  data: SectionTransactItem[];
};

export const transactSections: TransactSection[] = [
  {
    id: 1,
    data: [
      {
        date: '27 Sep 2021',
        data: [
          {
            icon: faHamburger,
            category: 'Food & Drink',
            amount: 20,
            date: '22/07/21',
            color: '#6665DD',
          },
          {
            icon: faHome,
            category: 'Home Rent',
            amount: -20,
            date: '22/07/21',
            color: '#07B6FF',
          },
        ],
      },
      {
        date: '25 Sep 2021',
        data: [
          {
            icon: faLayerGroup,
            category: 'Food & Drink',
            amount: 20,
            date: '22/07/21',
            color: '#F27B1F',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    data: [
      {
        date: '27 Sep 2021',
        data: [
          {
            icon: faLayerGroup,
            category: 'Food & Drink',
            amount: 20,
            date: '22/07/21',
            color: '#F27B1F',
          },
        ],
      },
      {
        date: '25 Sep 2021',
        data: [
          {
            icon: faHamburger,
            category: 'Food & Drink',
            amount: 20,
            date: '22/07/21',
            color: '#6665DD',
          },
          {
            icon: faHome,
            category: 'Home Rent',
            amount: -20,
            date: '22/07/21',
            color: '#07B6FF',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    data: [
      {
        date: '27 Sep 2021',
        data: [
          {
            icon: faHamburger,
            category: 'Food & Drink',
            amount: 20,
            date: '22/07/21',
            color: '#6665DD',
          },
        ],
      },
      {
        date: '25 Sep 2021',
        data: [
          {
            icon: faLayerGroup,
            category: 'Food & Drink',
            amount: 20,
            date: '22/07/21',
            color: '#F27B1F',
          },
        ],
      },
      {
        date: '24 Sep 2021',
        data: [
          {
            icon: faHome,
            category: 'Home Rent',
            amount: -20,
            date: '22/07/21',
            color: '#07B6FF',
          },
        ],
      },
    ],
  },
];
