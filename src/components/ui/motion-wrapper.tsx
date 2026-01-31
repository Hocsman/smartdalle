"use client";

import { motion } from "framer-motion";

export const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    },
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export function MotionDiv({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerGrid({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function MotionItem({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div variants={fadeIn} className={className}>
            {children}
        </motion.div>
    )
}
