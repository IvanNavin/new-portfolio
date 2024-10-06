import { Work } from '@app/[lang]/my-works/types';
import { clsxm } from '@repo/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';

import styles from './styles.module.scss';

type Props = {
  item: Work;
};

export const WorkItem = ({
  item: { name, status, route, frontPicture, backPicture, stack },
}: Props) => {
  const router = useRouter();

  return (
    <div className={styles.item}>
      <button className={styles.screen} onClick={() => router.push(route)}>
        {status && <span className={styles.status}>{status}</span>}
        <div className={styles.bar}>
          <h5 className={styles.h5}>{name}</h5>
          <i className={styles.items} />
        </div>
        <div className={styles.main}>
          {frontPicture && (
            <Image
              priority={true}
              src={frontPicture}
              alt={name}
              className={styles.back}
            />
          )}
          <div className={clsxm(styles.tags)}>
            <ul className={styles.skills}>
              {stack.map((stack, index) => {
                const delay = parseFloat((0.3 + index * 0.1).toFixed(1));

                return (
                  <li
                    key={index}
                    className={styles.skill}
                    style={{ '--delay': `${delay}s` } as CSSProperties}
                  >
                    {stack}
                  </li>
                );
              })}
            </ul>
            <picture className={styles.img}>
              {backPicture && (
                <Image
                  priority={true}
                  src={backPicture}
                  alt={name}
                  className='absolute inset-0 object-cover'
                />
              )}
            </picture>
          </div>
        </div>
      </button>
    </div>
  );
};
