'use client'

import { useState } from 'react';

import Modal, { openOnEscFn } from '@/components/Modal';

import Link from 'next/link';

import styles from './headerbar.module.css';

export default function HamburgerMenu() {
	const [open, setOpen] = useState(false);

    return <div>
			<div className={styles.burgermenu} onClick={() => setOpen(true)}>
				<div className={styles.burgerbar}/>
				<div className={styles.burgerbar}/>
				<div className={styles.burgerbar}/>
			</div>
			
			<Modal opened={open} onClose={() => setOpen(false)} doOnKey={openOnEscFn(() => setOpen(true))}>
				<nav className={styles.linklist} onClick={() => setOpen(false)}>
					<span>
						<Link href={'/'}>
							Home
						</Link>
					</span>
					<span>
						<Link href={'/dylanchat'}>
							Talk to Dylan
						</Link>
					</span>
					<span>
						<Link href={'/weather'}>
							Weather
						</Link>
					</span>
					<span>
						<Link href={'/planner'}>
							Daily Planner
						</Link>
					</span>
					<span>
						<Link href={'/visualizer'}>
							Music Visualizer
						</Link>
					</span>
					<span>
						<Link href={'/poll'}>
							Polls
						</Link>
					</span>
					<span>
						<Link href={'/interval'}>
							Interval Timer
						</Link>
					</span>
					<span>
						<Link href={'/tts'}>
							TTS
						</Link>
					</span>
					<span>
						<Link href={'/linux'}>
							Linux Stuff
						</Link>
					</span>
					<div className={styles.linkdivider}/>
					<span>
						<Link href='mailto:djlafo@gmail.com'>djlafo@gmail.com</Link>
					</span>
					<span>
						<Link href='https://github.com/djlafo' target="_blank" rel="noreferrer">github.com/djlafo</Link>
					</span>
					<span>
						<Link href="https://www.linkedin.com/in/dylan-lafont-99a58a150/" target="_blank" rel="noreferrer">LinkedIn</Link>
					</span>
				</nav>
			</Modal>

		</div>;
}
