import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Generate pastel color from string (for auto avatars)
export function generatePastelColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 85%)`;
}

// Get initials from title (for auto-generated thumbnails)
export function getInitials(title: string): string {
    return title.substring(0, 2).toUpperCase();
}

// Generate a random share slug
export function generateShareSlug(): string {
    return Math.random().toString(36).substring(2, 10);
}

// Detect link type from URL
export function detectLinkType(url: string): 'youtube' | 'facebook' | 'maps' | 'generic' {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('facebook.com') || url.includes('fb.com')) return 'facebook';
    if (url.includes('google.com/maps') || url.includes('maps.google')) return 'maps';
    return 'generic';
}

// Format date
export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// Pastel gradient colors for auto-generated thumbnails
const THUMBNAIL_GRADIENTS = [
    "linear-gradient(135deg, #f48fb1, #f06292)",
    "linear-gradient(135deg, #ce93d8, #ba68c8)",
    "linear-gradient(135deg, #90caf9, #64b5f6)",
    "linear-gradient(135deg, #80cbc4, #4db6ac)",
    "linear-gradient(135deg, #ffcc80, #ffa726)",
    "linear-gradient(135deg, #ef9a9a, #ef5350)",
    "linear-gradient(135deg, #a5d6a7, #66bb6a)",
    "linear-gradient(135deg, #b39ddb, #7e57c2)",
];

export function getThumbnailColor(title: string): string {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return THUMBNAIL_GRADIENTS[Math.abs(hash) % THUMBNAIL_GRADIENTS.length];
}
