import HamburgerMenu from './HamburgerMenu';
import LoginButton from './LoginButton';

import styles from './headerbar.module.css';

export default function HeaderBar() {
	return <div className={styles.headerbar}>
		<HamburgerMenu/>
		<span>Dylan Lafont</span>
		<LoginButton/>
	</div>;
}