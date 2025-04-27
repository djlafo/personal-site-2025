'use client'

import { useEffect, useState } from 'react';

import Modal, { openOnEscFn } from '@/components/Modal';

import Link from 'next/link';

import styles from './headerbar.module.css';
import { getFullUserInfo } from '@/actions/auth';

export default function HamburgerMenu() {
	const [open, setOpen] = useState(false);
	const [user, setUser] = useState<Awaited<ReturnType<typeof getFullUserInfo>>>();
	const [coords, setCoords] = useState<string>();

	useEffect(() => {
		getFullUserInfo().then(fullUser => {
			if(fullUser && typeof window !== 'undefined') {
				const zip = localStorage.getItem('zip')?.toString();
				const coords = localStorage.getItem('coords')?.toString();
				if(zip === fullUser.zip) {
					setCoords(coords);
				}
			}
			setUser(fullUser);
		});
	}, []);

    return <div>
			<div className={styles.burgermenu} onClick={() => setOpen(true)}>
				<div className={styles.burgerbar}/>
				<div className={styles.burgerbar}/>
				<div className={styles.burgerbar}/>
			</div>
			
			<Modal fullVertical 
				opened={open} 
				onClose={() => setOpen(false)} 
				doOnKey={openOnEscFn(() => setOpen(true))}>
					
				<nav className={styles.linklist} onClick={() => setOpen(false)}>
					<span>
						<Link className='button-style' href={'/'}>
							Home
						</Link>
					</span>
					<span>
						<Link className='button-style' href={'/account'}>
							Account
						</Link>
					</span>
					<span>
						<Link className='button-style' href={'/dylanchat'}>
							Talk to Dylan
						</Link>
					</span>
					<span>
						<Link className='button-style' href={'/planner'}>
							Planner
						</Link>
					</span>
					<span>
						<Link className='button-style' href={user && user.zip ? `/weather/${user.zip}/${coords || ''}` : '/weather'}>
							Weather
						</Link>
					</span>
					<span>
						<Link className='button-style' href={'/notes'}>
							Notes & Files
						</Link>
					</span>
					<span>
						<Link className='button-style' href={'/visualizer'}>
							Music Visualizer
						</Link>
					</span>
					<span>
						<Link className='button-style' href={'/poll'}>
							Polls
						</Link>
					</span>
					<span>
						<Link className='button-style' href={'/interval'}>
							Interval Timer
						</Link>
					</span>
					<span>
						<Link className='button-style' href={'/linux'}>
							Linux Stuff
						</Link>
					</span>
					{user && user.username === 'dylan' &&
						<span>
							<Link className='button-style' href={'/admin'}>
								Admin
							</Link>
						</span>
						|| <></>
					}
					<div className={styles.linkdivider}/>
					<span>
						<Link className='button-style' href='/resume.pdf' target='_blank' rel='noreferrer'>Resume</Link>
					</span>
					<span>
						<Link className='button-style' href='mailto:djlafo@gmail.com'>djlafo@gmail.com</Link>
					</span>
					<span>
						<Link className='button-style' href='https://github.com/djlafo' target="_blank" rel="noreferrer">github.com/djlafo</Link>
					</span>
					<span>
						<Link className='button-style' href="https://www.linkedin.com/in/dylan-lafont-99a58a150/" target="_blank" rel="noreferrer">LinkedIn</Link>
					</span>
				</nav>
			</Modal>

		</div>;
}
