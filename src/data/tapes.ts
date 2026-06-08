export interface Tape {
  id: string;
  brand: string;
  typeText: string;
  year: string;
  label: string;
  color: string;
  textColor: string;
  videoUrl: string;
}

export const tapes: Tape[] = [
  {
    id: '1',
    brand: 'STROVA',
    typeText: 'VIDEOCASSETTE\nT-120',
    year: '2025',
    label: 'Fairy Fox',
    color: '#f4ece4',
    textColor: '#1a1a1a',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
  },
  {
    id: '2',
    brand: 'DIRC',
    typeText: 'HIGH GRADE HRS\nT-120',
    year: '2024',
    label: 'Roadtrip',
    color: '#c42828',
    textColor: '#ffffff',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4'
  },
  {
    id: '3',
    brand: 'LUX',
    typeText: 'BRILLIANT COLOR\nT-120',
    year: '2023',
    label: 'Wedding',
    color: '#13284a',
    textColor: '#ffffff',
    videoUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4'
  },
  {
    id: '4',
    brand: 'GSR',
    typeText: 'VIDEOCASSETTE\nGOLD',
    year: '2021',
    label: 'Mixtape',
    color: '#c59b48',
    textColor: '#1a1a1a',
    videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4'
  }
];
