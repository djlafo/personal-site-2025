// import { Page, GlowBackdrop } from '../../components';
import Image from 'next/image';
import Link from 'next/link';

import GlowBackdrop from '@/components/GlowBackdrop';

import styles from '@/app/page.module.css';

export default function Home() {
    return <>
        <GlowBackdrop id='selfie-glow' deviation='7'/>
        <div className={styles.home}>
            <h1>
                Hey, I&apos;m Dylan Lafont
            </h1>
            <Image src='/selfie.jpg' 
                style={{filter: 'url(#selfie-glow)'}}
                width={1316}
                height={1624}
                className={styles.selfie} 
                alt='selfie'/>
            <p>
                Welcome to the site!<br/>
                <br/>
                If you&apos;re a recruiter, <Link href='/resume.pdf' target='_blank' rel='noreferrer'>here</Link> is a link to my resume.<br/>
                <br/>
                Feel free to look at the <Link href='https://github.com/djlafo/personal-site-2025' target='_blank' rel='noreferrer'>source code</Link> of this site or look around.
                I&apos;ve kept responsive design in mind, and it&apos;s hosted manually on an EC2 Debian instance.  
                Just don&apos;t look at the commit history, which consists of embarassing commit messages and commits 1000 lines long or 1 line long.  My standards are much higher for production sites I swear.  
                I mainly add things here that I use on a daily basis without regard to rollbacks or other maintainers.  Of course security is always a must so don&apos;t try to SQL inject me (or do).<br/>
                <br/>
                You can use ESC as a quick way to reach the menu.
            </p>
        </div>
    </>;
}