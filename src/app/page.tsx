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
                Hello, I'm Dylan Lafont
            </h1>
            <Image src='/selfie.jpg' 
                style={{filter: 'url(#selfie-glow)'}}
                width={1316}
                height={1624}
                className={styles.selfie} 
                alt='selfie'/>
            <p>
                A while ago, I took a sabbatical from work to focus on long-term mental health issues that made normal life difficult for me, such as agoraphobia.
                <br/>
                <br/>
                I&apos;m happy to say I was successful. I've grown a lot as a person, and I&apos;m now ready to hop back into code.
                <br/>
                <br/>
                I&apos;ll be using the rest of the website to throw useful tools in for me and misc stuff
                <br/>
                <br/>
                Here&apos;s my <Link href='/resume.pdf' target='_blank' rel='noreferrer'>resume</Link>
            </p>
        </div>
    </>;
}