import React from 'react';
import styles from './Modal.module.less';
import Button from '../Button/Button'; 
import { useEffect } from 'react';
import ReactDOM from 'react-dom';

type SemanticDOM = 'mask' | 'wrapper' | 'content' | 'header' | 'body' | 'footer' | 'close';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onOk: () => void;
    loading?: boolean;
    title?: React.ReactNode;
    content?: React.ReactNode;
    footer?: React.ReactNode | null;
    showClose?: boolean;
    okText?: string;
    cancelText?: string;
    styles?: Partial<Record<SemanticDOM, React.CSSProperties>>;
    style?: React.CSSProperties;
}

function ModalSkeleton() {
    return (
        <div className={styles.skeletonWrapper}>
            <div className={styles.skeletonLine} style={{ width: '90%' }} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
        </div>
    );
}



export default function Modal(props: ModalProps) {
    const {
        open = false,
        onClose,
        onOk,
        loading = false,
        title,
        content,
        footer,
        showClose = true,
        okText = "确定",
        cancelText = "取消",
        styles: customStyles = {}, 
        style = {},
    } = props;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]); 

    useEffect(() => {
        if (open) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [open]);

    
    const handleMaskClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    

    const renderDefaultFooter = () => (
        <div className={styles.modalFooter} style={customStyles.footer}>
            <Button color='danger'  onClick={onClose}>{cancelText}</Button>
            <Button color="primary" loading={loading} onClick={onOk}>
                {okText}
            </Button>
        </div>
    );


   const renderFooter = () => {
        if (footer === null) return null;
        if (loading) return null;
        return footer || renderDefaultFooter();
    };

    const modalContent = (
        <div className={styles.mask} onClick={handleMaskClick}>
            <div className={styles.wrapper} style={customStyles.wrapper}>
                <div className={styles.modalContent} style={{ ...style, ...customStyles.content }}>
                    {title && (
                         <div className={styles.modalHeader} style={customStyles.header}>
                            <div className={styles.title}>{title}</div>
                            {showClose && !loading && (
                                <span className={styles.closeButton} style={customStyles.close} onClick={onClose}>
                                    &times;
                                </span>
                            )}
                        </div>
                    )}
                    <div className={styles.modalBody} style={customStyles.body}>
                        {loading ? <ModalSkeleton /> : content}
                    </div>
                    {renderFooter()}
                </div>
            </div>
        </div>
    );


    if (!open) {
        return null;
    }

    if (typeof document === 'undefined') {
        return null;
    }

   return ReactDOM.createPortal(modalContent, document.body);
}