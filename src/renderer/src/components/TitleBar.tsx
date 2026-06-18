import styles from './TitleBar.module.css'

export default function TitleBar(): JSX.Element {
  const minimize = (): void => window.api?.minimizeWindow()
  const maximize = (): void => window.api?.maximizeWindow()
  const close = (): void => window.api?.closeWindow()

  return (
    <div className={styles.titleBar}>
      <div className={styles.drag} />
      <div className={styles.controls}>
        <button className={styles.btn} onClick={minimize} title="Minimize">
          <span className={styles.iconMinimize} />
        </button>
        <button className={styles.btn} onClick={maximize} title="Maximize">
          <span className={styles.iconMaximize} />
        </button>
        <button className={`${styles.btn} ${styles.btnClose}`} onClick={close} title="Close">
          <span className={styles.iconClose} />
        </button>
      </div>
    </div>
  )
}
