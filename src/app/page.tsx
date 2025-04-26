// import { Page, GlowBackdrop } from '../../components';
import Image from 'next/image';
import Link from 'next/link';

import GlowBackdrop from '@/components/GlowBackdrop';

import styles from '@/app/page.module.css';

export default function Home() {
    return <>
        <GlowBackdrop id='selfie-glow' deviation='7'/>
        <div className={styles.home}>
            <Image src='/selfie.jpg' 
                style={{filter: 'url(#selfie-glow)'}}
                width={1316}
                height={1624}
                className={styles.selfie} 
                alt='selfie'/>
            <p>
                Welcome to the site!<br/>
                You can use [ESC] as a quick way to reach the menu.<br/>
            </p>
            <p>
                <Link href='/resume.pdf' target='_blank' rel='noreferrer'>Here</Link> is a link to my resume<br/>
                <Link href='https://github.com/djlafo/personal-site-2025' target='_blank' rel='noreferrer'>Here</Link> is a link to the source code<br/>
            </p>
            <p>
                The features here are mainly things for my daily use.  There are quite a bit of features that are locked behind having an account, and you&apos;re free to register.
            </p>
        </div>
    </>;
}