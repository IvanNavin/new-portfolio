import { GitHub, Instagram, LinkedIn } from '@components/svg';
import Link from 'next/link';

export const SocialLinks = () => {
  return (
    <div className='fixed right-[65px] top-[45px]'>
      <Link
        className='absolute animate-linkedin-rotate opacity-0'
        href='https://www.linkedin.com/in/holovkoivan/'
        title='link to linkedin profile'
        target='_blank'
      >
        <LinkedIn />
      </Link>
      <Link
        className='absolute animate-github-rotate opacity-0'
        href='https://github.com/IvanNavin/'
        title='link to github profile'
        target='_blank'
      >
        <GitHub />
      </Link>
      <Link
        className='absolute animate-instagram-rotate opacity-0'
        href='https://www.instagram.com/oivanholovko/'
        title='link to instagram profile'
        target='_blank'
      >
        <Instagram />
      </Link>
    </div>
  );
};
