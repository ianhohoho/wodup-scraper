import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkoutModal = ({ workout, onClose }) => {
    if (!workout) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-surface w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl shadow-2xl border border-white/10 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-surface">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{workout.program}</h2>
                            <p className="text-secondary">{workout.date}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
                        {workout.details}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WorkoutModal;
