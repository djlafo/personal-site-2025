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
						<Link href={'/Linux'}>
							Linux Stuff
						</Link>
					</span>
					<span>
						<Link href={'/Interval'}>
							Interval Timer
						</Link>
					</span>
					<span>
						<Link href={'/Weather'}>
							Weather
						</Link>
					</span>
					<span>
						<Link href={'/Visualizer'}>
							Music Visualizer
						</Link>
					</span>
					<span>
						<Link href={'/Planner'}>
							Daily Planner
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
