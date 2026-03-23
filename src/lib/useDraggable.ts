// src/lib/useDraggable.ts
'use client';

import { useRef, useState, useEffect } from 'react';

export interface UseDraggableReturn {
    modalRef: React.RefObject<HTMLDivElement | null>;
    handleRef: React.RefObject<HTMLDivElement | null>;
    isDragging: boolean;
}

/**
 * 모달 드래그 이동 훅
 * handleRef 영역을 잡고 드래그하면 modalRef 요소가 이동합니다.
 * isOpen이 true가 될 때 이벤트 리스너를 등록하고, false가 되면 위치를 초기화합니다.
 */
export function useDraggable(isOpen: boolean): UseDraggableReturn {
    // 1. ref
    const modalRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);

    // 2. 드래그 내부 상태 (ref — 렌더 없이 이벤트 핸들러에서 직접 참조)
    const isDraggingRef = useRef(false);
    const pos = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

    // 3. 외부에 노출할 isDragging state (오버레이 닫기 방지용)
    const [isDragging, setIsDragging] = useState(false);

    // 4. effect — isOpen 변경 시 이벤트 등록/해제 및 위치 초기화
    useEffect(() => {
        if (!isOpen) return;

        const handle = handleRef.current;
        const modal = modalRef.current;
        if (!handle || !modal) return;

        // 모달 열릴 때 위치 초기화
        pos.current = { x: 0, y: 0 };
        modal.style.transform = '';

        const onMouseDown = (e: MouseEvent) => {
            // 버튼·입력 요소 클릭은 드래그 시작 안 함
            if ((e.target as HTMLElement).closest('button, input, textarea, select, a')) return;

            isDraggingRef.current = true;
            setIsDragging(true);
            dragStart.current = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                posX: pos.current.x,
                posY: pos.current.y,
            };
            e.preventDefault();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            pos.current = {
                x: dragStart.current.posX + e.clientX - dragStart.current.mouseX,
                y: dragStart.current.posY + e.clientY - dragStart.current.mouseY,
            };
            // 성능을 위해 DOM 직접 조작 (setState 호출 없음)
            modal.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
        };

        const onMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            setIsDragging(false);
        };

        handle.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            handle.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            isDraggingRef.current = false;
            setIsDragging(false);
        };
    }, [isOpen]);

    return { modalRef, handleRef, isDragging };
}
